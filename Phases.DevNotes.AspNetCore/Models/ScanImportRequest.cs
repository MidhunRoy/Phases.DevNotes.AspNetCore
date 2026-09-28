namespace Phases.DevNotes.AspNetCore.Models
{
    public class ScanImportRequest
    {
        public List<ScanImportSelection> Items { get; set; } = new();
    }

    public class ScanImportSelection
    {
        public string FilePath { get; set; } = string.Empty;
        public int LineNumber { get; set; }
    }
}
