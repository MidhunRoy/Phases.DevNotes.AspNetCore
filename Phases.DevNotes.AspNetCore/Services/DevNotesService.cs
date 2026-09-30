using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Phases.DevNotes.AspNetCore.Models;
using Phases.DevNotes.AspNetCore.Options;
using Phases.DevNotes.AspNetCore.Storage;
using System.Text.Json;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal class DevNotesService : IDevNotesService
    {
        private const string UnknownCreatedBy = "Unknown";
        private readonly JsonStorageProvider<DevNote> _storage;
        private readonly string _dataFolderPath;
        private readonly object _sync = new();
        private static readonly JsonSerializerOptions BackupJsonOptions = new(JsonSerializerDefaults.Web)
        {
            WriteIndented = true
        };

        public DevNotesService(
            JsonStorageProvider<DevNote> storage,
            IHostEnvironment hostEnvironment,
            IOptions<DevNotesOptions> optionsAccessor)
        {
            _storage = storage;
            var options = optionsAccessor?.Value ?? new DevNotesOptions();
            var folderName = string.IsNullOrWhiteSpace(options.DataFolderName) ? ".devnotes" : options.DataFolderName.Trim();
            _dataFolderPath = Path.Combine(hostEnvironment.ContentRootPath, folderName);
        }

        public List<DevNote> GetAll()
        {
            lock (_sync)
            {
                return _storage.GetAll();
            }
        }

        public (int Total, List<DevNote> Items) Search(string? search, string? type, string? sort, int page, int pageSize)
        {
            var safePage = page < 1 ? 1 : page;
            var safePageSize = pageSize < 1 ? 10 : pageSize;
            var skip = (safePage - 1) * safePageSize;

            lock (_sync)
            {
                var notes = _storage.GetAll() ?? new List<DevNote>();
                var term = search?.Trim();
                var hasSearch = !string.IsNullOrWhiteSpace(term);
                var normalizedType = NormalizeTypeFilter(type);
                var isOldestFirst = string.Equals(sort?.Trim(), "oldest", StringComparison.OrdinalIgnoreCase);

                var filtered = notes
                    .Where(note => !hasSearch || MatchesSearch(note, term!))
                    .Where(note => normalizedType is null || string.Equals((note.Type ?? string.Empty).Trim(), normalizedType, StringComparison.OrdinalIgnoreCase));

                filtered = isOldestFirst
                    ? filtered.OrderBy(note => note.CreatedAt)
                    : filtered.OrderByDescending(note => note.CreatedAt);

                var materialized = filtered.ToList();
                var total = materialized.Count;
                var items = materialized.Skip(skip).Take(safePageSize).ToList();

                return (total, items);
            }
        }

        public void Add(DevNote note)
        {
            if (note is null)
            {
                throw new ArgumentNullException(nameof(note));
            }

            SanitizeNote(note);

            lock (_sync)
            {
                var notes = _storage.GetAll();
                notes.Add(note);
                _storage.Save(notes);
            }
        }

        public DevNote? Update(Guid id, DevNote updatedNote)
        {
            if (updatedNote is null)
            {
                throw new ArgumentNullException(nameof(updatedNote));
            }

            SanitizeNote(updatedNote);

            lock (_sync)
            {
                var notes = _storage.GetAll();
                var existing = notes.FirstOrDefault(x => x.Id == id);
                if (existing is null)
                {
                    return null;
                }

                existing.Title = updatedNote.Title;
                existing.Description = updatedNote.Description;
                existing.Type = updatedNote.Type;
                existing.CreatedBy = updatedNote.CreatedBy;
                existing.Attachment = updatedNote.Attachment;
                existing.Attachments = updatedNote.Attachments;
                existing.FilePath = updatedNote.FilePath;
                existing.MethodName = updatedNote.MethodName;
                existing.LineNumber = updatedNote.LineNumber;
                existing.Tags = updatedNote.Tags;
                _storage.Save(notes);
                return existing;
            }
        }

        public bool Delete(Guid id)
        {
            lock (_sync)
            {
                var notes = _storage.GetAll();
                var removed = notes.RemoveAll(x => x.Id == id) > 0;
                if (!removed)
                {
                    return false;
                }

                _storage.Save(notes);
                return true;
            }
        }

        public DevNotesStats GetStatistics()
        {
            lock (_sync)
            {
                var notes = _storage.GetAll() ?? new List<DevNote>();
                var stats = new DevNotesStats
                {
                    TotalNotes = notes.Count
                };

                foreach (var note in notes)
                {
                    var type = (note.Type ?? string.Empty).Trim();
                    if (string.Equals(type, "bug", StringComparison.OrdinalIgnoreCase))
                    {
                        stats.BugCount++;
                    }
                    else if (string.Equals(type, "idea", StringComparison.OrdinalIgnoreCase))
                    {
                        stats.IdeaCount++;
                    }
                    else if (string.Equals(type, "task", StringComparison.OrdinalIgnoreCase))
                    {
                        stats.TaskCount++;
                    }
                    else
                    {
                        stats.OtherCount++;
                    }

                    stats.TotalAttachments += CountAttachments(note);
                }

                var contributorGroups = notes
                    .Select(note => NormalizeCreatedBy(note.CreatedBy))
                    .GroupBy(name => name, StringComparer.OrdinalIgnoreCase)
                    .ToList();

                stats.ContributorCount = contributorGroups.Count;
                stats.TopContributors = contributorGroups
                    .Select(group => new DevNotesContributorStat
                    {
                        Name = group.Key,
                        Count = group.Count()
                    })
                    .OrderByDescending(entry => entry.Count)
                    .ThenBy(entry => entry.Name, StringComparer.OrdinalIgnoreCase)
                    .Take(5)
                    .ToList();

                var latestNote = notes
                    .OrderByDescending(note => note.CreatedAt)
                    .FirstOrDefault();

                if (latestNote is not null)
                {
                    stats.LastUpdated = latestNote.CreatedAt;
                    stats.LastUpdatedBy = NormalizeCreatedBy(latestNote.CreatedBy);
                }

                return stats;
            }
        }

        public DevNotesExport Export()
        {
            lock (_sync)
            {
                var notes = _storage.GetAll() ?? new List<DevNote>();
                var exportItems = notes.Select(ToExportItem).ToList();

                return new DevNotesExport
                {
                    Version = DevNotesExport.CurrentVersion,
                    ExportedAt = DateTime.UtcNow,
                    TotalNotes = exportItems.Count,
                    Notes = exportItems
                };
            }
        }

        public ImportResult Import(DevNotesExport data, ImportMode mode)
        {
            if (data is null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            var importedNotes = (data.Notes ?? new List<DevNoteExportItem>())
                .Select(ToDevNote)
                .ToList();

            lock (_sync)
            {
                if (mode == ImportMode.Replace)
                {
                    CreateBackup();
                    _storage.Save(importedNotes);

                    return new ImportResult
                    {
                        ImportedCount = importedNotes.Count,
                        SkippedCount = 0,
                        TotalNotes = importedNotes.Count
                    };
                }

                var existing = _storage.GetAll() ?? new List<DevNote>();
                var existingIds = new HashSet<Guid>(existing.Select(n => n.Id));
                var importedCount = 0;
                var skippedCount = 0;

                foreach (var note in importedNotes)
                {
                    if (existingIds.Contains(note.Id))
                    {
                        skippedCount++;
                        continue;
                    }

                    existing.Add(note);
                    existingIds.Add(note.Id);
                    importedCount++;
                }

                _storage.Save(existing);

                return new ImportResult
                {
                    ImportedCount = importedCount,
                    SkippedCount = skippedCount,
                    TotalNotes = existing.Count
                };
            }
        }

        private void CreateBackup()
        {
            try
            {
                var notes = _storage.GetAll() ?? new List<DevNote>();
                var backupFolder = Path.Combine(_dataFolderPath, "backups");
                Directory.CreateDirectory(backupFolder);

                var timestamp = DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
                var backupPath = Path.Combine(backupFolder, $"devnotes-backup-{timestamp}.json");
                var json = JsonSerializer.Serialize(notes, BackupJsonOptions);
                File.WriteAllText(backupPath, json);
            }
            catch
            {
            }
        }

        private static DevNoteExportItem ToExportItem(DevNote note)
        {
            return new DevNoteExportItem
            {
                Id = note.Id,
                Title = note.Title ?? string.Empty,
                Description = note.Description ?? string.Empty,
                Type = note.Type ?? string.Empty,
                CreatedBy = NormalizeCreatedBy(note.CreatedBy),
                Attachment = note.Attachment ?? string.Empty,
                Attachments = note.Attachments?.ToList() ?? new List<string>(),
                Tags = note.Tags?.ToList() ?? new List<string>(),
                CreatedAt = note.CreatedAt
            };
        }

        private static DevNote ToDevNote(DevNoteExportItem item)
        {
            var note = new DevNote
            {
                Id = item.Id == Guid.Empty ? Guid.NewGuid() : item.Id,
                Title = item.Title ?? string.Empty,
                Description = item.Description ?? string.Empty,
                Type = item.Type ?? string.Empty,
                CreatedBy = item.CreatedBy ?? string.Empty,
                Attachment = item.Attachment ?? string.Empty,
                Attachments = item.Attachments?.ToList() ?? new List<string>(),
                Tags = item.Tags?.ToList() ?? new List<string>(),
                CreatedAt = item.CreatedAt
            };

            SanitizeNote(note);
            return note;
        }

        private static void SanitizeNote(DevNote note)
        {
            note.Title = note.Title?.Trim() ?? string.Empty;
            note.Description = note.Description?.Trim() ?? string.Empty;
            note.Type = note.Type?.Trim() ?? string.Empty;
            note.CreatedBy = NormalizeCreatedBy(note.CreatedBy);
            note.FilePath = note.FilePath?.Trim() ?? string.Empty;
            note.MethodName = note.MethodName?.Trim() ?? string.Empty;
            note.LineNumber = note.LineNumber is > 0 ? note.LineNumber : null;
            note.Tags = note.Tags?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList() ?? new List<string>();

            if (note.CreatedAt == default || note.CreatedAt.Year < 2000)
            {
                note.CreatedAt = DateTime.UtcNow;
            }

            NormalizeAttachments(note);
        }

        private static string NormalizeCreatedBy(string? createdBy)
        {
            var value = createdBy?.Trim();
            return string.IsNullOrWhiteSpace(value) ? UnknownCreatedBy : value;
        }

        private static void NormalizeAttachments(DevNote note)
        {
            var paths = new List<string>();
            if (note.Attachments is { Count: > 0 })
            {
                foreach (var p in note.Attachments)
                {
                    var t = p?.Trim();
                    if (!string.IsNullOrWhiteSpace(t))
                    {
                        paths.Add(t);
                    }
                }
            }

            var legacy = note.Attachment?.Trim() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(legacy) &&
                !paths.Exists(x => x.Equals(legacy, StringComparison.OrdinalIgnoreCase)))
            {
                paths.Insert(0, legacy);
            }

            var distinct = paths
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            note.Attachments = distinct;
            note.Attachment = distinct.Count > 0 ? distinct[0] : string.Empty;
        }

        private static int CountAttachments(DevNote note)
        {
            var paths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (note.Attachments is { Count: > 0 })
            {
                foreach (var path in note.Attachments)
                {
                    var trimmed = path?.Trim();
                    if (!string.IsNullOrWhiteSpace(trimmed))
                    {
                        paths.Add(trimmed);
                    }
                }
            }

            var legacy = note.Attachment?.Trim();
            if (!string.IsNullOrWhiteSpace(legacy))
            {
                paths.Add(legacy);
            }

            return paths.Count;
        }

        private static bool ContainsValue(string? source, string term)
        {
            return source?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false;
        }

        private static bool MatchesSearch(DevNote note, string term)
        {
            return ContainsValue(note.Title, term) ||
                ContainsValue(note.Description, term) ||
                ContainsValue(note.FilePath, term) ||
                ContainsValue(note.MethodName, term) ||
                (note.Tags?.Any(tag => ContainsValue(tag, term)) ?? false);
        }

        private static string? NormalizeTypeFilter(string? type)
        {
            var value = (type ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(value) || string.Equals(value, "all", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            if (string.Equals(value, "bug", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(value, "idea", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(value, "task", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(value, "code", StringComparison.OrdinalIgnoreCase))
            {
                return value;
            }

            return null;
        }
    }
}
