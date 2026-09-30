using Microsoft.Extensions.Hosting;
using Phases.DevNotes.AspNetCore.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal sealed class CodeGuidePdfExportService : ICodeGuidePdfExportService
    {
        private static int _licenseConfigured;

        private readonly IDevNotesService _notesService;
        private readonly ICodePreviewService _codePreviewService;
        private readonly IHostEnvironment _hostEnvironment;

        public CodeGuidePdfExportService(
            IDevNotesService notesService,
            ICodePreviewService codePreviewService,
            IHostEnvironment hostEnvironment)
        {
            _notesService = notesService;
            _codePreviewService = codePreviewService;
            _hostEnvironment = hostEnvironment;
        }

        public CodeGuidePdfExportResult Export(CodeGuidePdfExportRequest request)
        {
            try
            {
                EnsureCommunityLicense();

                var scope = NormalizeScope(request?.Scope);
                var requestedPaths = NormalizeRequestedPaths(request?.FilePaths);

                if (scope is "currentfile" or "selectedfiles" && requestedPaths.Count == 0)
                {
                    return CodeGuidePdfExportResult.Fail(
                        scope == "currentfile"
                            ? "Select a file before exporting the current file."
                            : "Select at least one file to export.");
                }

                var annotations = GetCodeGuideAnnotations()
                    .Where(note => MatchesScope(note, scope, requestedPaths))
                    .ToList();

                if (annotations.Count == 0)
                {
                    return CodeGuidePdfExportResult.Fail("No Code Guide annotations found for the selected scope.");
                }

                var files = BuildFileModels(annotations);
                if (files.Count == 0)
                {
                    return CodeGuidePdfExportResult.Fail("No Code Guide annotations found for the selected scope.");
                }

                var projectTitle = ResolveProjectTitle();
                var documentModel = new CodeGuidePdfDocumentModel
                {
                    ProjectTitle = projectTitle,
                    Subtitle = "Code Learning Guide",
                    ProjectKind = "ASP.NET Core Project",
                    GeneratedAtUtc = DateTime.UtcNow,
                    Files = files
                };

                var pdfBytes = CodeGuidePdfDocument.Generate(documentModel);
                var safeName = SanitizeFileName(projectTitle);
                var fileName = $"{safeName}-code-guide-{DateTime.UtcNow:yyyy-MM-dd}.pdf";

                return CodeGuidePdfExportResult.Ok(
                    pdfBytes,
                    fileName,
                    files.Sum(file => file.Annotations.Count),
                    files.Count);
            }
            catch (Exception)
            {
                return CodeGuidePdfExportResult.Fail("Failed to generate Code Guide PDF.");
            }
        }

        private List<DevNote> GetCodeGuideAnnotations()
        {
            var notes = _notesService.GetAll() ?? new List<DevNote>();
            return notes
                .Where(IsCodeGuideAnnotation)
                .ToList();
        }

        private static bool IsCodeGuideAnnotation(DevNote note)
        {
            var path = NormalizePath(note.FilePath);
            if (string.IsNullOrWhiteSpace(path))
            {
                return false;
            }

            // Attachment-looking paths are not Code Guide locations.
            if (path.Contains("/devnotes/uploads/", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return true;
        }

        private static bool MatchesScope(DevNote note, string scope, HashSet<string> requestedPaths)
        {
            if (scope == "entireproject")
            {
                return true;
            }

            var path = NormalizePath(note.FilePath);
            return requestedPaths.Contains(path);
        }

        private List<CodeGuidePdfFileModel> BuildFileModels(IEnumerable<DevNote> annotations)
        {
            var groups = annotations
                .GroupBy(note => NormalizePath(note.FilePath), StringComparer.OrdinalIgnoreCase)
                .OrderBy(group => group.Key, StringComparer.OrdinalIgnoreCase)
                .ToList();

            var files = new List<CodeGuidePdfFileModel>();
            foreach (var group in groups)
            {
                var ordered = group
                    .Select((note, index) => new { note, index })
                    .OrderBy(item => GetLineNumber(item.note) ?? int.MaxValue)
                    .ThenBy(item => item.index)
                    .Select(item => item.note)
                    .ToList();

                var annotationModels = new List<CodeGuidePdfAnnotationModel>();
                for (var i = 0; i < ordered.Count; i++)
                {
                    var note = ordered[i];
                    var title = string.IsNullOrWhiteSpace(note.Title) ? "Untitled" : note.Title.Trim();
                    var lineNumber = GetLineNumber(note);
                    var sections = CodeGuideLearningParser.Parse(note.Description, title);
                    var preview = lineNumber is > 0
                        ? _codePreviewService.GetPreview(note.FilePath, lineNumber)
                        : null;

                    annotationModels.Add(new CodeGuidePdfAnnotationModel
                    {
                        Number = i + 1,
                        Title = title,
                        FilePath = group.Key,
                        FileName = GetFileBaseName(group.Key),
                        LineNumber = lineNumber,
                        MethodName = note.MethodName?.Trim() ?? string.Empty,
                        Sections = sections.ToList(),
                        RelatedCode = ToRelatedCode(preview)
                    });
                }

                files.Add(new CodeGuidePdfFileModel
                {
                    FilePath = group.Key,
                    FileName = GetFileBaseName(group.Key),
                    Annotations = annotationModels
                });
            }

            return files;
        }

        private static CodeGuidePdfRelatedCodeModel? ToRelatedCode(CodePreviewResult? previewResult)
        {
            if (previewResult?.Preview?.Lines is not { Count: > 0 } lines)
            {
                return null;
            }

            return new CodeGuidePdfRelatedCodeModel
            {
                StartLine = previewResult.Preview.StartLine,
                EndLine = previewResult.Preview.EndLine,
                HighlightLine = previewResult.Preview.HighlightLine,
                Lines = lines
                    .Select(line => new CodeGuidePdfCodeLineModel
                    {
                        Number = line.Number,
                        Content = line.Content ?? string.Empty,
                        Highlight = line.Highlight
                    })
                    .ToList()
            };
        }

        private string ResolveProjectTitle()
        {
            var applicationName = _hostEnvironment.ApplicationName?.Trim();
            if (!string.IsNullOrWhiteSpace(applicationName) &&
                !string.Equals(applicationName, "Phases.DevNotes.AspNetCore", StringComparison.OrdinalIgnoreCase))
            {
                return applicationName;
            }

            var contentRoot = _hostEnvironment.ContentRootPath;
            if (!string.IsNullOrWhiteSpace(contentRoot))
            {
                var folderName = new DirectoryInfo(contentRoot).Name;
                if (!string.IsNullOrWhiteSpace(folderName))
                {
                    return folderName;
                }
            }

            return "DevNotes Project";
        }

        private static string NormalizeScope(string? scope)
        {
            var value = (scope ?? "entireProject").Trim().ToLowerInvariant();
            return value switch
            {
                "current" or "currentfile" or "file" => "currentfile",
                "selected" or "selectedfiles" or "files" => "selectedfiles",
                _ => "entireproject"
            };
        }

        private static HashSet<string> NormalizeRequestedPaths(IEnumerable<string>? paths)
        {
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (paths is null)
            {
                return set;
            }

            foreach (var path in paths)
            {
                var normalized = NormalizePath(path);
                if (!string.IsNullOrWhiteSpace(normalized))
                {
                    set.Add(normalized);
                }
            }

            return set;
        }

        private static string NormalizePath(string? path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return string.Empty;
            }

            var normalized = path.Replace('\\', '/').Trim();
            while (normalized.StartsWith("./", StringComparison.Ordinal))
            {
                normalized = normalized[2..];
            }

            while (normalized.StartsWith('/'))
            {
                normalized = normalized[1..];
            }

            return normalized;
        }

        private static string GetFileBaseName(string filePath)
        {
            var normalized = NormalizePath(filePath);
            var parts = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length > 0 ? parts[^1] : normalized;
        }

        private static int? GetLineNumber(DevNote note)
        {
            if (note.LineNumber is > 0)
            {
                return note.LineNumber.Value;
            }

            return null;
        }

        private static string SanitizeFileName(string value)
        {
            var cleaned = string.Join("-", (value ?? "project")
                .Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries))
                .Trim();

            return string.IsNullOrWhiteSpace(cleaned) ? "project" : cleaned;
        }

        private static void EnsureCommunityLicense()
        {
            if (Interlocked.Exchange(ref _licenseConfigured, 1) == 1)
            {
                return;
            }

            // Community license for eligible use; required before GeneratePdf.
            QuestPDF.Settings.License = LicenseType.Community;
        }
    }
}
