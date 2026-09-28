namespace Phases.DevNotes.AspNetCore.Models
{
    /// <summary>
    /// Note shape used in export files. Excludes internal code-reference paths.
    /// </summary>
    public class DevNoteExportItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string Attachment { get; set; } = string.Empty;
        public List<string> Attachments { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}
