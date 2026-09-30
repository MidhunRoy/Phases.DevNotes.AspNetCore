using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Phases.DevNotes.AspNetCore.Models;
using Phases.DevNotes.AspNetCore.Options;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal sealed class DevNotesScannerService : IDevNotesScannerService
    {
        private const int MaxResults = 500;
        private const int BinaryProbeLength = 8192;

        private static readonly HashSet<string> IgnoredDirectoryNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "bin",
            "obj",
            ".git",
            ".vs",
            "node_modules",
            ".devnotes"
        };

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".cs",
            ".cshtml",
            ".razor",
            ".js",
            ".ts",
            ".tsx",
            ".css",
            ".html",
            ".json",
            ".xml",
            ".sql",
            ".md",
            ".yml",
            ".yaml"
        };

        private readonly string _contentRootPath;
        private readonly IDevNotesService _devNotesService;
        private readonly int _maxFiles;
        private readonly long _maxFileSizeBytes;
        private readonly bool _enabled;
        private List<ScannedNote> _lastScanItems = new();

        public DevNotesScannerService(
            IHostEnvironment hostEnvironment,
            IOptions<DevNotesOptions> optionsAccessor,
            IDevNotesService devNotesService)
        {
            _contentRootPath = hostEnvironment.ContentRootPath ?? string.Empty;
            _devNotesService = devNotesService;

            var options = optionsAccessor?.Value ?? new DevNotesOptions();
            _enabled = options.EnableTodoScanner;
            _maxFiles = options.ScannerMaxFiles > 0 ? options.ScannerMaxFiles : DevNotesOptions.DefaultScannerMaxFiles;
            _maxFileSizeBytes = options.ScannerMaxFileSizeBytes > 0
                ? options.ScannerMaxFileSizeBytes
                : DevNotesOptions.DefaultScannerMaxFileSizeBytes;
        }

        public ScanResult Scan()
        {
            if (!_enabled)
            {
                return new ScanResult();
            }

            var items = new List<ScannedNote>();
            var skippedFiles = 0;
            var scannedFiles = 0;
            var remainingCapacity = MaxResults;

            if (string.IsNullOrWhiteSpace(_contentRootPath) || !Directory.Exists(_contentRootPath))
            {
                return new ScanResult();
            }

            var stack = new Stack<string>();
            stack.Push(_contentRootPath);

            while (stack.Count > 0 && scannedFiles < _maxFiles && remainingCapacity > 0)
            {
                var currentDirectory = stack.Pop();
                IEnumerable<string> entries;

                try
                {
                    entries = Directory.EnumerateFileSystemEntries(currentDirectory);
                }
                catch
                {
                    skippedFiles++;
                    continue;
                }

                foreach (var entry in entries)
                {
                    if (remainingCapacity <= 0 || scannedFiles >= _maxFiles)
                    {
                        break;
                    }

                    if (Directory.Exists(entry))
                    {
                        var directoryName = Path.GetFileName(entry);
                        if (!string.IsNullOrEmpty(directoryName) && IgnoredDirectoryNames.Contains(directoryName))
                        {
                            continue;
                        }

                        stack.Push(entry);
                        continue;
                    }

                    if (!ShouldScanFile(entry, out var relativePath))
                    {
                        continue;
                    }

                    scannedFiles++;

                    if (!TryReadTextFile(entry, out var lines))
                    {
                        skippedFiles++;
                        continue;
                    }

                    var detectMethodNames = relativePath.EndsWith(".cs", StringComparison.OrdinalIgnoreCase);
                    var fileMatches = TodoCommentParser.ParseFile(
                        relativePath,
                        lines,
                        detectMethodNames,
                        MaxResults,
                        ref remainingCapacity);

                    if (fileMatches.Count > 0)
                    {
                        items.AddRange(fileMatches);
                    }
                }
            }

            _lastScanItems = items;

            return new ScanResult
            {
                TotalFound = items.Count,
                Items = items,
                Warning = skippedFiles > 0 ? $"{skippedFiles} files skipped" : null
            };
        }

        public ScanImportResult Import(IReadOnlyList<ScannedNote> notes, string? createdBy = null)
        {
            if (!_enabled || notes is null || notes.Count == 0)
            {
                return new ScanImportResult();
            }

            var resolvedNotes = ResolveNotesForImport(notes);
            if (resolvedNotes.Count == 0)
            {
                return new ScanImportResult();
            }

            var existingNotes = _devNotesService.GetAll();
            var created = 0;
            var skipped = 0;
            var updated = 0;
            var author = string.IsNullOrWhiteSpace(createdBy) ? "Unknown" : createdBy.Trim();

            foreach (var scanned in resolvedNotes)
            {
                var existing = FindExistingNote(existingNotes, scanned);
                if (existing is not null)
                {
                    if (TryRefreshExistingFromScan(existing, scanned))
                    {
                        _devNotesService.Update(existing.Id, existing);
                        updated++;
                    }
                    else
                    {
                        skipped++;
                    }

                    continue;
                }

                var note = new DevNote
                {
                    Title = scanned.Title,
                    Description = scanned.Description,
                    Type = scanned.Type,
                    FilePath = scanned.FilePath,
                    MethodName = scanned.MethodName,
                    LineNumber = scanned.LineNumber > 0 ? scanned.LineNumber : null,
                    Tags = scanned.Tags?.ToList() ?? new List<string>(),
                    CreatedBy = author
                };

                _devNotesService.Add(note);
                existingNotes.Add(note);
                created++;
            }

            return new ScanImportResult
            {
                Created = created,
                Skipped = skipped,
                Updated = updated
            };
        }

        private List<ScannedNote> ResolveNotesForImport(IReadOnlyList<ScannedNote> notes)
        {
            if (_lastScanItems.Count == 0)
            {
                Scan();
            }

            var resolved = new List<ScannedNote>();
            foreach (var note in notes)
            {
                var normalizedPath = NormalizeRelativePath(note.FilePath);
                if (string.IsNullOrEmpty(normalizedPath) || note.LineNumber <= 0)
                {
                    continue;
                }

                var match = _lastScanItems.FirstOrDefault(item =>
                    item.LineNumber == note.LineNumber &&
                    string.Equals(NormalizeRelativePath(item.FilePath), normalizedPath, StringComparison.OrdinalIgnoreCase));

                resolved.Add(match ?? note);
            }

            return resolved;
        }

        private static DevNote? FindExistingNote(IEnumerable<DevNote> existingNotes, ScannedNote scanned)
        {
            var path = NormalizeRelativePath(scanned.FilePath);
            var title = scanned.Title?.Trim() ?? string.Empty;
            var scannedLine = scanned.LineNumber > 0 ? scanned.LineNumber : (int?)null;

            // Exact match: same file + line + title (unchanged on disk).
            var exact = existingNotes.FirstOrDefault(note =>
                string.Equals(NormalizeRelativePath(note.FilePath), path, StringComparison.OrdinalIgnoreCase) &&
                note.LineNumber == scannedLine &&
                string.Equals((note.Title ?? string.Empty).Trim(), title, StringComparison.OrdinalIgnoreCase));
            if (exact is not null)
            {
                return exact;
            }

            // Code Guide annotations: match by file + title so a moved DEVNOTE
            // can refresh its LineNumber after a rescan instead of duplicating.
            if (!IsCodeGuideScannedNote(scanned))
            {
                return null;
            }

            return existingNotes.FirstOrDefault(note =>
                IsCodeGuideStoredNote(note) &&
                string.Equals(NormalizeRelativePath(note.FilePath), path, StringComparison.OrdinalIgnoreCase) &&
                string.Equals((note.Title ?? string.Empty).Trim(), title, StringComparison.OrdinalIgnoreCase));
        }

        private static bool TryRefreshExistingFromScan(DevNote existing, ScannedNote scanned)
        {
            var nextLine = scanned.LineNumber > 0 ? scanned.LineNumber : (int?)null;
            var nextMethod = scanned.MethodName ?? string.Empty;
            var nextDescription = scanned.Description ?? string.Empty;

            var lineChanged = existing.LineNumber != nextLine;
            var methodChanged = !string.Equals(existing.MethodName ?? string.Empty, nextMethod, StringComparison.Ordinal);
            var descriptionChanged = !string.IsNullOrWhiteSpace(nextDescription)
                && !string.Equals(existing.Description ?? string.Empty, nextDescription, StringComparison.Ordinal);

            if (!lineChanged && !methodChanged && !descriptionChanged)
            {
                return false;
            }

            existing.LineNumber = nextLine;
            if (methodChanged)
            {
                existing.MethodName = nextMethod;
            }

            if (descriptionChanged)
            {
                existing.Description = nextDescription;
            }

            return true;
        }

        private static bool IsCodeGuideScannedNote(ScannedNote scanned)
        {
            if (string.Equals(scanned.Type, "code", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return scanned.Tags is not null
                && scanned.Tags.Any(tag =>
                    string.Equals(tag, "code", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(tag, "devnote", StringComparison.OrdinalIgnoreCase));
        }

        private static bool IsCodeGuideStoredNote(DevNote note)
        {
            if (string.Equals(note.Type, "code", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return note.Tags is not null
                && note.Tags.Any(tag =>
                    string.Equals(tag, "code", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(tag, "devnote", StringComparison.OrdinalIgnoreCase));
        }

        private bool ShouldScanFile(string fullPath, out string relativePath)
        {
            relativePath = string.Empty;

            var extension = Path.GetExtension(fullPath);
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return false;
            }

            try
            {
                var fileInfo = new FileInfo(fullPath);
                if (!fileInfo.Exists || fileInfo.Length > _maxFileSizeBytes)
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }

            if (!TryGetRelativePath(fullPath, out relativePath))
            {
                return false;
            }

            return true;
        }

        private bool TryGetRelativePath(string fullPath, out string relativePath)
        {
            relativePath = string.Empty;
            if (string.IsNullOrWhiteSpace(_contentRootPath))
            {
                return false;
            }

            var contentRoot = Path.GetFullPath(_contentRootPath);
            var normalizedFullPath = Path.GetFullPath(fullPath);
            if (!normalizedFullPath.StartsWith(contentRoot, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            relativePath = NormalizeRelativePath(Path.GetRelativePath(contentRoot, normalizedFullPath));
            return relativePath.Length > 0;
        }

        private static string NormalizeRelativePath(string? path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return string.Empty;
            }

            return path.Replace('\\', '/').TrimStart('/');
        }

        private static bool TryReadTextFile(string fullPath, out string[] lines)
        {
            lines = Array.Empty<string>();

            try
            {
                using var stream = new FileStream(
                    fullPath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.ReadWrite);

                if (IsBinaryStream(stream))
                {
                    return false;
                }

                stream.Position = 0;
                using var reader = new StreamReader(stream, detectEncodingFromByteOrderMarks: true);
                var content = reader.ReadToEnd();
                lines = content.Replace("\r\n", "\n", StringComparison.Ordinal)
                    .Replace('\r', '\n')
                    .Split('\n');
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsBinaryStream(Stream stream)
        {
            var buffer = new byte[Math.Min(BinaryProbeLength, (int)Math.Max(0, stream.Length))];
            if (buffer.Length == 0)
            {
                return false;
            }

            var read = stream.Read(buffer, 0, buffer.Length);
            for (var i = 0; i < read; i++)
            {
                if (buffer[i] == 0)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
