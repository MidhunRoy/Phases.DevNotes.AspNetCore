namespace Phases.DevNotes.AspNetCore.Models
{
    public class CodePreviewLine
    {
        public int Number { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool Highlight { get; set; }
    }
}
