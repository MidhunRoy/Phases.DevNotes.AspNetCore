namespace Phases.DevNotes.AspNetCore.Models
{
    public class DevNotesExport
    {
        public const string CurrentVersion = "1.0";

        public string Version { get; set; } = CurrentVersion;
        public DateTime ExportedAt { get; set; }
        public int TotalNotes { get; set; }
        public List<DevNoteExportItem> Notes { get; set; } = new();
    }
}
