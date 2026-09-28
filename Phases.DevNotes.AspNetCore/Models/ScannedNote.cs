namespace Phases.DevNotes.AspNetCore.Models
{
    public class ScannedNote
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string MethodName { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
    }
}
