namespace Phases.DevNotes.AspNetCore.Models
{
    public class CodePreview
    {
        public string FilePath { get; set; } = string.Empty;
        public string Language { get; set; } = "plaintext";
        public int StartLine { get; set; }
        public int EndLine { get; set; }
        public int? HighlightLine { get; set; }
        public string? OpenUrl { get; set; }
        public List<CodePreviewLine> Lines { get; set; } = new();
    }
}
