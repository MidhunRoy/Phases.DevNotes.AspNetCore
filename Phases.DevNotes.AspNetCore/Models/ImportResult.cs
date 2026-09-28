namespace Phases.DevNotes.AspNetCore.Models
{
    public class ImportResult
    {
        public int ImportedCount { get; set; }
        public int SkippedCount { get; set; }
        public int TotalNotes { get; set; }
    }
}
