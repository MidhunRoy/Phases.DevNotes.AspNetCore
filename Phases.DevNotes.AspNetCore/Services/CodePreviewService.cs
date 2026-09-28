using Microsoft.Extensions.Hosting;
using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal sealed class CodePreviewService : ICodePreviewService
    {
        private const int ContextBefore = 10;
        private const int ContextAfter = 10;
        private const int MaxReturnedLines = 50;

        private static readonly HashSet<string> IgnoredDirectoryNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "bin",
            "obj",
            ".git",
            ".vs",
            "node_modules",
            ".devnotes"
        };

        private static readonly HashSet<string> BlockedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".exe",
            ".dll",
            ".pdb",
            ".zip",
            ".png",
            ".jpg",
            ".pdf"
        };

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".cs",
            ".cshtml",
            ".razor",
            ".js",
            ".ts",
            ".css",
            ".html",
            ".json",
            ".xml",
            ".md",
            ".txt",
            ".sql",
            ".yml"
        };

        private static readonly Dictionary<string, string> LanguageByExtension = new(StringComparer.OrdinalIgnoreCase)
        {
            [".cs"] = "csharp",
            [".cshtml"] = "csharp",
            [".razor"] = "csharp",
            [".js"] = "javascript",
            [".ts"] = "typescript",
            [".css"] = "css",
            [".html"] = "html",
            [".json"] = "json",
            [".xml"] = "xml",
            [".md"] = "markdown",
            [".txt"] = "plaintext",
            [".sql"] = "sql",
            [".yml"] = "yaml"
        };

        private readonly string _contentRootPath;

        public CodePreviewService(IHostEnvironment hostEnvironment)
        {
            _contentRootPath = hostEnvironment.ContentRootPath ?? string.Empty;
        }

        public CodePreviewResult GetPreview(string filePath, int? lineNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    return CodePreviewResult.Fail("Cannot open this file");
                }

                if (!TryResolveSafePath(filePath.Trim(), out var fullPath, out var relativePath))
                {
                    return CodePreviewResult.Fail("Cannot open this file");
                }

                if (!File.Exists(fullPath))
                {
                    return CodePreviewResult.Fail("Source file no longer exists");
                }

                var highlightLine = lineNumber is > 0 ? lineNumber.Value : (int?)null;
                var anchorLine = highlightLine ?? 1;
                var startLine = Math.Max(1, anchorLine - ContextBefore);
                var endLine = anchorLine + ContextAfter;

                if (endLine - startLine + 1 > MaxReturnedLines)
                {
                    var half = MaxReturnedLines / 2;
                    startLine = Math.Max(1, anchorLine - half);
                    endLine = startLine + MaxReturnedLines - 1;
                }

                var lines = ReadLineRange(fullPath, startLine, endLine, highlightLine);
                if (lines.Count > 0)
                {
                    startLine = lines[0].Number;
                    endLine = lines[^1].Number;
                }

                var preview = new CodePreview
                {
                    FilePath = relativePath,
                    Language = DetectLanguage(relativePath),
                    StartLine = startLine,
                    EndLine = endLine,
                    HighlightLine = highlightLine,
                    OpenUrl = BuildOpenUrl(fullPath, highlightLine),
                    Lines = lines
                };

                return CodePreviewResult.Success(preview);
            }
            catch (UnauthorizedAccessException)
            {
                return CodePreviewResult.Fail("Cannot open this file");
            }
            catch (IOException)
            {
                return CodePreviewResult.Fail("Cannot open this file");
            }
            catch
            {
                return CodePreviewResult.Fail("Unable to load code preview.");
            }
        }

        private bool TryResolveSafePath(string filePath, out string fullPath, out string relativePath)
        {
            fullPath = string.Empty;
            relativePath = string.Empty;

            if (string.IsNullOrWhiteSpace(_contentRootPath))
            {
                return false;
            }

            var normalized = filePath.Replace('\\', '/').Trim();
            while (normalized.StartsWith('/'))
            {
                normalized = normalized[1..];
            }

            if (string.IsNullOrWhiteSpace(normalized) ||
                normalized.Contains("..", StringComparison.Ordinal) ||
                Path.IsPathRooted(normalized))
            {
                return false;
            }

            var segments = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);
            foreach (var segment in segments)
            {
                if (segment is "." or ".." || IgnoredDirectoryNames.Contains(segment))
                {
                    return false;
                }
            }

            var extension = Path.GetExtension(normalized);
            if (string.IsNullOrWhiteSpace(extension) ||
                BlockedExtensions.Contains(extension) ||
                !AllowedExtensions.Contains(extension))
            {
                return false;
            }

            var root = Path.GetFullPath(_contentRootPath);
            if (!root.EndsWith(Path.DirectorySeparatorChar))
            {
                root += Path.DirectorySeparatorChar;
            }

            fullPath = Path.GetFullPath(Path.Combine(_contentRootPath, normalized.Replace('/', Path.DirectorySeparatorChar)));
            if (!fullPath.StartsWith(root, StringComparison.OrdinalIgnoreCase))
            {
                fullPath = string.Empty;
                return false;
            }

            relativePath = string.Join('/', segments);
            return true;
        }

        private static List<CodePreviewLine> ReadLineRange(string fullPath, int startLine, int endLine, int? highlightLine)
        {
            var lines = new List<CodePreviewLine>();
            using var reader = new StreamReader(fullPath);
            var currentLine = 0;
            string? content;

            while ((content = reader.ReadLine()) != null)
            {
                currentLine++;
                if (currentLine < startLine)
                {
                    continue;
                }

                if (currentLine > endLine)
                {
                    break;
                }

                lines.Add(new CodePreviewLine
                {
                    Number = currentLine,
                    Content = content,
                    Highlight = highlightLine.HasValue && currentLine == highlightLine.Value
                });
            }

            return lines;
        }

        private static string DetectLanguage(string relativePath)
        {
            var extension = Path.GetExtension(relativePath);
            return LanguageByExtension.TryGetValue(extension, out var language)
                ? language
                : "plaintext";
        }

        private static string? BuildOpenUrl(string fullPath, int? highlightLine)
        {
            if (!File.Exists(fullPath))
            {
                return null;
            }

            var normalized = fullPath.Replace('\\', '/');

            return highlightLine is > 0
                ? $"vscode://file/{normalized}:{highlightLine.Value}"
                : $"vscode://file/{normalized}";
        }
    }
}
