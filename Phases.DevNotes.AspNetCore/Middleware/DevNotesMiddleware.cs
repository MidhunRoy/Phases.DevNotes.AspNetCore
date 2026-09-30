using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Phases.DevNotes.AspNetCore.Models;
using Phases.DevNotes.AspNetCore.Options;
using Phases.DevNotes.AspNetCore.Services;
using System.Globalization;
using System.Diagnostics;
using System.Text.Json;

namespace Phases.DevNotes.AspNetCore.Middleware
{
    public class DevNotesMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly string _routePrefix;
        private readonly string _uploadsFolder;
        private readonly string _defaultCreatedBy;
        private readonly long _maxUploadSizeInBytes;
        private readonly HashSet<string> _allowedUploadExtensions;
        private readonly bool _enableTodoScanner;
        private static readonly HashSet<string> BlockedUploadExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".exe",
            ".dll",
            ".bat",
            ".cmd",
            ".ps1",
            ".sh",
            ".msi",
            ".vbs",
            ".js",
            ".jar"
        };
        private static readonly HashSet<string> ImageUploadExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp"
        };
        private const string UnknownCreatedBy = "Unknown";
        private const long MaxImportSizeInBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> SupportedExportVersions = new(StringComparer.OrdinalIgnoreCase)
        {
            DevNotesExport.CurrentVersion
        };
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
        private static readonly HashSet<string> IgnoredDirectoryNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "bin",
            "obj",
            ".git",
            ".vs",
            "node_modules",
            ".devnotes"
        };
        private static readonly HashSet<string> AllowedSuggestionExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".cs", ".csproj", ".sln", ".slnx", ".cshtml", ".razor",
            ".js", ".ts", ".tsx", ".css", ".html",
            ".json", ".xml", ".config", ".md", ".txt",
            ".sql", ".yml", ".yaml", ".props", ".targets"
        };

        public DevNotesMiddleware(RequestDelegate next, IHostEnvironment hostEnvironment, IOptions<DevNotesOptions> optionsAccessor)
        {
            _next = next;
            _hostEnvironment = hostEnvironment;

            var options = optionsAccessor?.Value ?? new DevNotesOptions();
            _routePrefix = NormalizeRoutePrefix(options.RoutePrefix);
            var dataFolder = string.IsNullOrWhiteSpace(options.DataFolderName) ? ".devnotes" : options.DataFolderName.Trim();
            var uploadsFolderName = string.IsNullOrWhiteSpace(options.UploadsFolderName) ? "uploads" : options.UploadsFolderName.Trim();
            _uploadsFolder = Path.Combine(_hostEnvironment.ContentRootPath, dataFolder, uploadsFolderName);
            _defaultCreatedBy = ResolveDefaultCreatedBy(options.DefaultCreatedBy);
            _maxUploadSizeInBytes = options.MaxUploadSizeInBytes > 0
                ? options.MaxUploadSizeInBytes
                : DevNotesOptions.DefaultMaxUploadSizeInBytes;
            _allowedUploadExtensions = new HashSet<string>(
                options.AllowedUploadExtensions ?? DevNotesOptions.DefaultAllowedUploadExtensions,
                StringComparer.OrdinalIgnoreCase);
            _enableTodoScanner = options.EnableTodoScanner;
        }

        public async Task Invoke(
            HttpContext context,
            IDevNotesService service,
            ICodePreviewService codePreviewService,
            IDevNotesScannerService scannerService,
            ICodeGuidePdfExportService codeGuidePdfExportService)
        {
            try
            {
                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/api")
                {
                    if (!TryParseApiPaging(context.Request.Query, out var page, out var pageSize, out var pagingError))
                    {
                        await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = pagingError });
                        return;
                    }

                    var search = context.Request.Query["search"].ToString();
                    var type = context.Request.Query["type"].ToString();
                    var sort = context.Request.Query["sort"].ToString();
                    var normalizedSort = NormalizeSort(sort);
                    var result = service.Search(search, type, normalizedSort, page, pageSize);

                    await WriteJsonAsync(context, StatusCodes.Status200OK, new
                    {
                        total = result.Total,
                        page,
                        pageSize,
                        search,
                        type,
                        sort = normalizedSort,
                        items = result.Items ?? new List<DevNote>()
                    });
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/code-guide/export.pdf")
                {
                    await HandleCodeGuidePdfExportAsync(context, codeGuidePdfExportService);
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/add")
                {
                    var note = await JsonSerializer.DeserializeAsync<DevNote>(context.Request.Body, JsonOptions, context.RequestAborted);
                    if (note is null)
                    {
                        await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Request body is required." });
                        return;
                    }

                    if (string.IsNullOrWhiteSpace(note.CreatedBy))
                    {
                        note.CreatedBy = _defaultCreatedBy;
                    }

                    service.Add(note);
                    await WriteJsonAsync(context, StatusCodes.Status200OK, new { message = "Note added successfully.", note });
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/upload")
                {
                    await HandleUploadAsync(context);
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/stats")
                {
                    await HandleStatsAsync(context, service);
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/config")
                {
                    await WriteJsonAsync(context, StatusCodes.Status200OK, new { defaultCreatedBy = _defaultCreatedBy });
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/export")
                {
                    await HandleExportAsync(context, service);
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/import")
                {
                    await HandleImportAsync(context, service);
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/files")
                {
                    var query = context.Request.Query["q"].ToString();
                    var suggestions = GetFileSuggestions(query);
                    await WriteJsonAsync(context, StatusCodes.Status200OK, new { items = suggestions });
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/code")
                {
                    await HandleCodePreviewAsync(context, codePreviewService);
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/scan")
                {
                    await HandleScanAsync(context, scannerService);
                    return;
                }

                if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path == $"{_routePrefix}/scan/import")
                {
                    await HandleScanImportAsync(context, scannerService);
                    return;
                }

                if (TryGetNoteId(context.Request.Path, out var noteId))
                {
                    if (HttpMethods.IsPut(context.Request.Method))
                    {
                        var updatedNote = await JsonSerializer.DeserializeAsync<DevNote>(context.Request.Body, JsonOptions, context.RequestAborted);
                        if (updatedNote is null)
                        {
                            await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Request body is required." });
                            return;
                        }

                        var result = service.Update(noteId, updatedNote);
                        if (result is null)
                        {
                            await WriteJsonAsync(context, StatusCodes.Status404NotFound, new { error = "Note not found." });
                            return;
                        }

                        await WriteJsonAsync(context, StatusCodes.Status200OK, new { message = "Note updated successfully.", note = result });
                        return;
                    }

                    if (HttpMethods.IsDelete(context.Request.Method))
                    {
                        var deleted = service.Delete(noteId);
                        if (!deleted)
                        {
                            await WriteJsonAsync(context, StatusCodes.Status404NotFound, new { error = "Note not found." });
                            return;
                        }

                        await WriteJsonAsync(context, StatusCodes.Status200OK, new { message = "Note deleted successfully." });
                        return;
                    }
                }
            }
            catch (JsonException)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid JSON payload." });
                return;
            }
            catch (Exception)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "An unexpected error occurred." });
                return;
            }

            try
            {
                await _next(context);
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "DevNotes route failed." });
            }
        }

        private static async Task HandleExportAsync(HttpContext context, IDevNotesService service)
        {
            try
            {
                var export = service.Export();
                var dateStamp = DateTime.UtcNow.ToString("yyyy-MM-dd");
                var fileName = $"devnotes-export-{dateStamp}.json";

                context.Response.StatusCode = StatusCodes.Status200OK;
                context.Response.ContentType = "application/json; charset=utf-8";
                context.Response.Headers.ContentDisposition = $"attachment; filename=\"{fileName}\"";

                await JsonSerializer.SerializeAsync(context.Response.Body, export, JsonOptions, context.RequestAborted);
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Export failed." });
            }
        }

        private static async Task HandleCodeGuidePdfExportAsync(HttpContext context, ICodeGuidePdfExportService exportService)
        {
            try
            {
                CodeGuidePdfExportRequest? request;
                try
                {
                    request = await JsonSerializer.DeserializeAsync<CodeGuidePdfExportRequest>(
                        context.Request.Body,
                        JsonOptions,
                        context.RequestAborted);
                }
                catch (JsonException)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid export request." });
                    return;
                }

                request ??= new CodeGuidePdfExportRequest();
                var result = exportService.Export(request);
                if (!result.Success || result.PdfBytes is null)
                {
                    await WriteJsonAsync(
                        context,
                        StatusCodes.Status400BadRequest,
                        new { error = result.Error ?? "Failed to generate Code Guide PDF." });
                    return;
                }

                var fileName = string.IsNullOrWhiteSpace(result.FileName)
                    ? $"code-guide-{DateTime.UtcNow:yyyy-MM-dd}.pdf"
                    : result.FileName;

                context.Response.StatusCode = StatusCodes.Status200OK;
                context.Response.ContentType = "application/pdf";
                context.Response.Headers.ContentDisposition = $"attachment; filename=\"{fileName}\"";
                context.Response.ContentLength = result.PdfBytes.Length;
                await context.Response.Body.WriteAsync(result.PdfBytes, context.RequestAborted);
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Failed to generate Code Guide PDF." });
            }
        }

        private static async Task HandleImportAsync(HttpContext context, IDevNotesService service)
        {
            try
            {
                if (!context.Request.HasFormContentType)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
                    return;
                }

                var form = await context.Request.ReadFormAsync(context.RequestAborted);
                var file = form.Files.FirstOrDefault();
                if (file is null || file.Length == 0)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
                    return;
                }

                if (file.Length > MaxImportSizeInBytes)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
                    return;
                }

                var extension = Path.GetExtension(file.FileName);
                if (!string.Equals(extension, ".json", StringComparison.OrdinalIgnoreCase))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
                    return;
                }

                DevNotesExport? exportData;
                await using (var stream = file.OpenReadStream())
                {
                    exportData = await JsonSerializer.DeserializeAsync<DevNotesExport>(stream, JsonOptions, context.RequestAborted);
                }

                if (!IsValidExportFile(exportData))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
                    return;
                }

                var mode = ParseImportMode(context.Request.Query["mode"].ToString());
                var result = service.Import(exportData!, mode);

                await WriteJsonAsync(context, StatusCodes.Status200OK, new
                {
                    message = "Import completed",
                    importedCount = result.ImportedCount,
                    skippedCount = result.SkippedCount,
                    totalNotes = result.TotalNotes
                });
            }
            catch (JsonException)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid DevNotes export file." });
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Import failed." });
            }
        }

        private async Task HandleScanAsync(HttpContext context, IDevNotesScannerService scannerService)
        {
            if (!_enableTodoScanner)
            {
                await WriteJsonAsync(context, StatusCodes.Status403Forbidden, new { error = "TODO scanner is disabled." });
                return;
            }

            try
            {
                var result = scannerService.Scan();
                await WriteJsonAsync(context, StatusCodes.Status200OK, new
                {
                    totalFound = result.TotalFound,
                    items = result.Items,
                    warning = result.Warning
                });
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Scan failed." });
            }
        }

        private async Task HandleScanImportAsync(HttpContext context, IDevNotesScannerService scannerService)
        {
            if (!_enableTodoScanner)
            {
                await WriteJsonAsync(context, StatusCodes.Status403Forbidden, new { error = "TODO scanner is disabled." });
                return;
            }

            try
            {
                var request = await JsonSerializer.DeserializeAsync<ScanImportRequest>(
                    context.Request.Body,
                    JsonOptions,
                    context.RequestAborted);

                if (request?.Items is null || request.Items.Count == 0)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "At least one item is required." });
                    return;
                }

                var notesToImport = request.Items
                    .Where(item => !string.IsNullOrWhiteSpace(item.FilePath) && item.LineNumber > 0)
                    .Select(item => new ScannedNote
                    {
                        FilePath = item.FilePath.Trim(),
                        LineNumber = item.LineNumber
                    })
                    .ToList();

                if (notesToImport.Count == 0)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "At least one valid item is required." });
                    return;
                }

                var result = scannerService.Import(notesToImport, _defaultCreatedBy);
                await WriteJsonAsync(context, StatusCodes.Status200OK, new
                {
                    created = result.Created,
                    skipped = result.Skipped
                });
            }
            catch (JsonException)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid JSON payload." });
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Scan import failed." });
            }
        }

        private static bool IsValidExportFile(DevNotesExport? export)
        {
            if (export is null)
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(export.Version) || !SupportedExportVersions.Contains(export.Version.Trim()))
            {
                return false;
            }

            return export.Notes is not null;
        }

        private static ImportMode ParseImportMode(string? mode)
        {
            return string.Equals(mode?.Trim(), "replace", StringComparison.OrdinalIgnoreCase)
                ? ImportMode.Replace
                : ImportMode.Merge;
        }

        private async Task HandleUploadAsync(HttpContext context)
        {
            try
            {
                if (!context.Request.HasFormContentType)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Expected multipart/form-data." });
                    return;
                }

                var form = await context.Request.ReadFormAsync(context.RequestAborted);
                var file = form.Files.FirstOrDefault();
                if (file is null || file.Length == 0)
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "No file uploaded." });
                    return;
                }

                var safeExtension = NormalizeUploadExtension(Path.GetExtension(file.FileName));

                if (!IsUploadSizeAllowed(file.Length))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "File size exceeds the allowed limit." });
                    return;
                }

                if (IsBlockedExtension(safeExtension))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "This file type is blocked for security reasons." });
                    return;
                }

                if (!IsExtensionAllowed(safeExtension))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "File type is not allowed." });
                    return;
                }

                Directory.CreateDirectory(_uploadsFolder);

                var fileName = $"{Guid.NewGuid():N}{safeExtension}";
                var savePath = Path.Combine(_uploadsFolder, fileName);

                await using (var stream = new FileStream(savePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await file.CopyToAsync(stream, context.RequestAborted);
                }

                var fileUrl = $"{_routePrefix}/uploads/{fileName}";
                var fileKind = IsImage(safeExtension, file.ContentType) ? "image" : "file";
                await WriteJsonAsync(context, StatusCodes.Status200OK, new { fileUrl, filePath = fileUrl, fileName = file.FileName, fileKind });
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                throw;
            }
            catch (IOException)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status400BadRequest, new { error = "Failed to save uploaded file." });
            }
            catch (UnauthorizedAccessException)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status400BadRequest, new { error = "Failed to save uploaded file." });
            }
            catch (Exception)
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Upload failed." });
            }
        }

        private bool IsExtensionAllowed(string extension)
        {
            return !string.IsNullOrEmpty(extension)
                && !IsBlockedExtension(extension)
                && _allowedUploadExtensions.Contains(extension);
        }

        private bool IsBlockedExtension(string extension)
        {
            return !string.IsNullOrEmpty(extension) && BlockedUploadExtensions.Contains(extension);
        }

        private bool IsUploadSizeAllowed(long size)
        {
            return size > 0 && size <= _maxUploadSizeInBytes;
        }

        private static bool IsImage(string extension, string? contentType)
        {
            if (string.IsNullOrWhiteSpace(contentType)
                || !contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return ImageUploadExtensions.Contains(extension);
        }

        private static string NormalizeUploadExtension(string? extension)
        {
            if (string.IsNullOrWhiteSpace(extension))
            {
                return string.Empty;
            }

            var value = extension.Trim().ToLowerInvariant();
            if (!value.StartsWith('.'))
            {
                value = "." + value;
            }

            return value;
        }

        private IReadOnlyList<string> GetFileSuggestions(string? query)
        {
            const int maxDepth = 3;
            const int maxScannedFiles = 1200;
            const int maxResults = 20;

            var term = (query ?? string.Empty).Trim();
            if (term.Length < 1)
            {
                return Array.Empty<string>();
            }

            var root = _hostEnvironment.ContentRootPath;
            if (string.IsNullOrWhiteSpace(root) || !Directory.Exists(root))
            {
                return Array.Empty<string>();
            }

            var matches = new List<string>(maxResults);
            var stack = new Stack<(string Path, int Depth)>();
            stack.Push((root, 0));
            var scannedFiles = 0;

            while (stack.Count > 0 && scannedFiles < maxScannedFiles && matches.Count < maxResults)
            {
                var (directory, depth) = stack.Pop();

                IEnumerable<string> files;
                try
                {
                    files = Directory.EnumerateFiles(directory, "*", SearchOption.TopDirectoryOnly);
                }
                catch
                {
                    continue;
                }

                foreach (var file in files)
                {
                    scannedFiles++;
                    if (scannedFiles > maxScannedFiles)
                    {
                        break;
                    }

                    var extension = Path.GetExtension(file);
                    if (!AllowedSuggestionExtensions.Contains(extension))
                    {
                        continue;
                    }

                    var relativePath = Path.GetRelativePath(root, file).Replace('\\', '/');
                    if (relativePath.Contains(term, StringComparison.OrdinalIgnoreCase))
                    {
                        matches.Add(relativePath);
                        if (matches.Count >= maxResults)
                        {
                            break;
                        }
                    }
                }

                if (depth >= maxDepth || matches.Count >= maxResults || scannedFiles >= maxScannedFiles)
                {
                    continue;
                }

                IEnumerable<string> directories;
                try
                {
                    directories = Directory.EnumerateDirectories(directory, "*", SearchOption.TopDirectoryOnly);
                }
                catch
                {
                    continue;
                }

                foreach (var child in directories)
                {
                    if (ShouldSkipDirectory(child))
                    {
                        continue;
                    }

                    stack.Push((child, depth + 1));
                }
            }

            return matches
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(path => path.Length)
                .ThenBy(path => path, StringComparer.OrdinalIgnoreCase)
                .Take(maxResults)
                .ToList();
        }

        private static bool ShouldSkipDirectory(string path)
        {
            var name = Path.GetFileName(path);
            return string.IsNullOrWhiteSpace(name) || IgnoredDirectoryNames.Contains(name);
        }

        private bool TryGetNoteId(PathString path, out Guid noteId)
        {
            noteId = default;
            var prefix = $"{_routePrefix}/";

            var value = path.Value ?? string.Empty;
            if (!value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var idSegment = value[prefix.Length..];
            if (string.IsNullOrWhiteSpace(idSegment) || idSegment.Contains('/'))
            {
                return false;
            }

            return Guid.TryParse(idSegment, out noteId);
        }

        private static bool TryParseApiPaging(IQueryCollection query, out int page, out int pageSize, out string? error)
        {
            const int defaultPage = 1;
            const int defaultPageSize = 10;
            const int maxPageSize = 100;
            const int maxPage = 1_000_000;

            page = defaultPage;
            pageSize = defaultPageSize;
            error = null;

            if (query.TryGetValue("page", out StringValues pageValues) && !StringValues.IsNullOrEmpty(pageValues))
            {
                if (!int.TryParse(pageValues.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var p) || p < 1)
                {
                    error = "Query parameter 'page' must be a positive integer.";
                    return false;
                }

                if (p > maxPage)
                {
                    error = $"Query parameter 'page' must not exceed {maxPage}.";
                    return false;
                }

                page = p;
            }

            if (query.TryGetValue("pageSize", out StringValues sizeValues) && !StringValues.IsNullOrEmpty(sizeValues))
            {
                if (!int.TryParse(sizeValues.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var ps) || ps < 1)
                {
                    error = "Query parameter 'pageSize' must be a positive integer.";
                    return false;
                }

                if (ps > maxPageSize)
                {
                    error = $"Query parameter 'pageSize' must not exceed {maxPageSize}.";
                    return false;
                }

                pageSize = ps;
            }

            try
            {
                checked
                {
                    _ = (long)(page - 1) * pageSize;
                }
            }
            catch (OverflowException)
            {
                error = "Query parameters 'page' and 'pageSize' are too large.";
                return false;
            }

            return true;
        }

        private static string NormalizeSort(string? sort)
        {
            return string.Equals(sort?.Trim(), "oldest", StringComparison.OrdinalIgnoreCase)
                ? "oldest"
                : "newest";
        }

        private static string NormalizeRoutePrefix(string? routePrefix)
        {
            var value = string.IsNullOrWhiteSpace(routePrefix) ? "/devnotes" : routePrefix.Trim();
            if (!value.StartsWith('/'))
            {
                value = "/" + value;
            }

            return value.Length > 1 ? value.TrimEnd('/') : value;
        }

        private static string ResolveDefaultCreatedBy(string? configuredDefault)
        {
            var configured = configuredDefault?.Trim();
            if (!string.IsNullOrWhiteSpace(configured))
            {
                return configured;
            }

            var gitName = ReadGitConfigValue("user.name");
            var gitEmail = ReadGitConfigValue("user.email");

            if (!string.IsNullOrWhiteSpace(gitName) && !string.IsNullOrWhiteSpace(gitEmail))
            {
                return $"{gitName} <{gitEmail}>";
            }

            if (!string.IsNullOrWhiteSpace(gitName))
            {
                return gitName;
            }

            if (!string.IsNullOrWhiteSpace(gitEmail))
            {
                return gitEmail;
            }

            return UnknownCreatedBy;
        }

        private static string ReadGitConfigValue(string key)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = "git",
                    Arguments = $"config {key}",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(startInfo);
                if (process is null)
                {
                    return string.Empty;
                }

                if (!process.WaitForExit(1500))
                {
                    try
                    {
                        process.Kill(entireProcessTree: true);
                    }
                    catch
                    {
                    }

                    return string.Empty;
                }

                if (process.ExitCode != 0)
                {
                    return string.Empty;
                }

                return (process.StandardOutput.ReadToEnd() ?? string.Empty).Trim();
            }
            catch
            {
                return string.Empty;
            }
        }

        private static async Task HandleCodePreviewAsync(HttpContext context, ICodePreviewService codePreviewService)
        {
            try
            {
                var file = context.Request.Query["file"].ToString();
                int? line = null;
                var lineRaw = context.Request.Query["line"].ToString();
                if (!string.IsNullOrWhiteSpace(lineRaw))
                {
                    if (!int.TryParse(lineRaw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedLine) || parsedLine < 1)
                    {
                        await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Query parameter 'line' must be a positive integer." });
                        return;
                    }

                    line = parsedLine;
                }

                if (string.IsNullOrWhiteSpace(file))
                {
                    await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Query parameter 'file' is required." });
                    return;
                }

                var result = codePreviewService.GetPreview(file, line);
                if (result.Preview is not null)
                {
                    await WriteJsonAsync(context, StatusCodes.Status200OK, result.Preview);
                    return;
                }

                var error = result.Error ?? "Unable to load code preview.";
                var statusCode = string.Equals(error, "Source file no longer exists", StringComparison.Ordinal)
                    ? StatusCodes.Status404NotFound
                    : StatusCodes.Status403Forbidden;

                if (string.Equals(error, "Unable to load code preview.", StringComparison.Ordinal))
                {
                    statusCode = StatusCodes.Status500InternalServerError;
                }

                await WriteJsonAsync(context, statusCode, new { error });
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status500InternalServerError, new { error = "Unable to load code preview." });
            }
        }

        private static async Task HandleStatsAsync(HttpContext context, IDevNotesService service)
        {
            try
            {
                var stats = service.GetStatistics();
                await WriteJsonAsync(context, StatusCodes.Status200OK, new
                {
                    totalNotes = stats.TotalNotes,
                    byType = new
                    {
                        bug = stats.BugCount,
                        idea = stats.IdeaCount,
                        task = stats.TaskCount,
                        other = stats.OtherCount
                    },
                    contributors = stats.ContributorCount,
                    topContributors = stats.TopContributors.Select(contributor => new
                    {
                        name = contributor.Name,
                        count = contributor.Count
                    }),
                    recentActivity = new
                    {
                        lastUpdated = stats.LastUpdated,
                        lastUpdatedBy = stats.LastUpdatedBy
                    },
                    totalAttachments = stats.TotalAttachments
                });
            }
            catch
            {
                await TryWriteJsonSafeAsync(context, StatusCodes.Status200OK, new
                {
                    totalNotes = 0,
                    byType = new { bug = 0, idea = 0, task = 0, other = 0 },
                    contributors = 0,
                    topContributors = Array.Empty<object>(),
                    recentActivity = new { lastUpdated = (DateTime?)null, lastUpdatedBy = (string?)null },
                    totalAttachments = 0
                });
            }
        }

        private static async Task WriteJsonAsync(HttpContext context, int statusCode, object payload)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json; charset=utf-8";
            await JsonSerializer.SerializeAsync(context.Response.Body, payload, JsonOptions, context.RequestAborted);
        }

        private static async Task TryWriteJsonSafeAsync(HttpContext context, int statusCode, object payload)
        {
            if (context.Response.HasStarted)
            {
                return;
            }

            try
            {
                await WriteJsonAsync(context, statusCode, payload);
            }
            catch
            {
                if (context.Response.HasStarted)
                {
                    return;
                }

                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "text/plain; charset=utf-8";
                await context.Response.WriteAsync("DevNotes unavailable.", context.RequestAborted);
            }
        }
    }
}
