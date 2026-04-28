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
        private const string UnknownCreatedBy = "Unknown";
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
        }

        public async Task Invoke(HttpContext context, IDevNotesService service)
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

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/config")
                {
                    await WriteJsonAsync(context, StatusCodes.Status200OK, new { defaultCreatedBy = _defaultCreatedBy });
                    return;
                }

                if (HttpMethods.IsGet(context.Request.Method) && context.Request.Path == $"{_routePrefix}/files")
                {
                    var query = context.Request.Query["q"].ToString();
                    var suggestions = GetFileSuggestions(query);
                    await WriteJsonAsync(context, StatusCodes.Status200OK, new { items = suggestions });
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
                await WriteJsonAsync(context, StatusCodes.Status400BadRequest, new { error = "Invalid JSON payload." });
                return;
            }
            catch (Exception)
            {
                await WriteJsonAsync(context, StatusCodes.Status500InternalServerError, new { error = "An unexpected error occurred." });
                return;
            }

            await _next(context);
        }

        private async Task HandleUploadAsync(HttpContext context)
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

            Directory.CreateDirectory(_uploadsFolder);

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension))
            {
                extension = ".bin";
            }

            var safeExtension = extension.Trim().ToLowerInvariant();
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

        private static bool IsImage(string extension, string? contentType)
        {
            if (extension is ".png" or ".jpg" or ".jpeg")
            {
                return true;
            }

            if (!string.IsNullOrWhiteSpace(contentType))
            {
                return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
            }

            return false;
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

        private static async Task WriteJsonAsync(HttpContext context, int statusCode, object payload)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json; charset=utf-8";
            await JsonSerializer.SerializeAsync(context.Response.Body, payload, JsonOptions, context.RequestAborted);
        }
    }
}
