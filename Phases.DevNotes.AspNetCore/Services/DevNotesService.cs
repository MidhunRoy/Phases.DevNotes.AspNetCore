using Phases.DevNotes.AspNetCore.Models;
using Phases.DevNotes.AspNetCore.Storage;
using System.Collections.Generic;
using System;
using System.Linq;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal class DevNotesService : IDevNotesService
    {
        private const string UnknownCreatedBy = "Unknown";
        private readonly JsonStorageProvider<DevNote> _storage;
        private readonly object _sync = new();

        public DevNotesService(JsonStorageProvider<DevNote> storage)
        {
            _storage = storage;
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

            note.Title = note.Title?.Trim() ?? string.Empty;
            note.Description = note.Description?.Trim() ?? string.Empty;
            note.Type = note.Type?.Trim() ?? string.Empty;
            note.CreatedBy = NormalizeCreatedBy(note.CreatedBy);
            note.Attachment = note.Attachment?.Trim() ?? string.Empty;
            note.FilePath = note.FilePath?.Trim() ?? string.Empty;
            note.MethodName = note.MethodName?.Trim() ?? string.Empty;
            note.LineNumber = note.LineNumber is > 0 ? note.LineNumber : null;
            note.Tags = note.Tags?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList() ?? new List<string>();
            if (note.CreatedAt == default)
            {
                note.CreatedAt = DateTime.UtcNow;
            }

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

            updatedNote.Title = updatedNote.Title?.Trim() ?? string.Empty;
            updatedNote.Description = updatedNote.Description?.Trim() ?? string.Empty;
            updatedNote.Type = updatedNote.Type?.Trim() ?? string.Empty;
            updatedNote.CreatedBy = NormalizeCreatedBy(updatedNote.CreatedBy);
            updatedNote.Attachment = updatedNote.Attachment?.Trim() ?? string.Empty;
            updatedNote.FilePath = updatedNote.FilePath?.Trim() ?? string.Empty;
            updatedNote.MethodName = updatedNote.MethodName?.Trim() ?? string.Empty;
            updatedNote.LineNumber = updatedNote.LineNumber is > 0 ? updatedNote.LineNumber : null;
            updatedNote.Tags = updatedNote.Tags?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList() ?? new List<string>();

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
                existing.FilePath = updatedNote.FilePath;
                existing.MethodName = updatedNote.MethodName;
                existing.LineNumber = updatedNote.LineNumber;
                existing.Tags = updatedNote.Tags;
                _storage.Save(notes);
                return existing;
            }
        }

        private static string NormalizeCreatedBy(string? createdBy)
        {
            var value = createdBy?.Trim();
            return string.IsNullOrWhiteSpace(value) ? UnknownCreatedBy : value;
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

        private static bool ContainsValue(string? source, string term)
        {
            return source?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false;
        }

        private static bool MatchesSearch(DevNote note, string term)
        {
            return ContainsValue(note.Title, term) ||
                ContainsValue(note.Description, term) ||
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
                string.Equals(value, "task", StringComparison.OrdinalIgnoreCase))
            {
                return value;
            }

            return null;
        }
    }
}
