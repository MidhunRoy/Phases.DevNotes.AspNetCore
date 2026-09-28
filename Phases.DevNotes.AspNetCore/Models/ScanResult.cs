namespace Phases.DevNotes.AspNetCore.Models
{
    public class ScanResult
    {
        public int TotalFound { get; set; }
        public List<ScannedNote> Items { get; set; } = new();
        public string? Warning { get; set; }
    }
}
