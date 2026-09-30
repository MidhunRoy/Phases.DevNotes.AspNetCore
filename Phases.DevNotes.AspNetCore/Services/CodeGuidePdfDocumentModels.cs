namespace Phases.DevNotes.AspNetCore.Services
{
    internal sealed class CodeGuidePdfDocumentModel
    {
        public string ProjectTitle { get; init; } = "Project";
        public string Subtitle { get; init; } = "Code Learning Guide";
        public string ProjectKind { get; init; } = "ASP.NET Core Project";
        public DateTime GeneratedAtUtc { get; init; } = DateTime.UtcNow;
        public List<CodeGuidePdfFileModel> Files { get; init; } = new();
    }

    internal sealed class CodeGuidePdfFileModel
    {
        public string FilePath { get; init; } = string.Empty;
        public string FileName { get; init; } = string.Empty;
        public List<CodeGuidePdfAnnotationModel> Annotations { get; init; } = new();
    }

    internal sealed class CodeGuidePdfAnnotationModel
    {
        public int Number { get; init; }
        public string Title { get; init; } = string.Empty;
        public string FilePath { get; init; } = string.Empty;
        public string FileName { get; init; } = string.Empty;
        public int? LineNumber { get; init; }
        public string MethodName { get; init; } = string.Empty;
        public List<CodeGuideLearningSection> Sections { get; init; } = new();
        public CodeGuidePdfRelatedCodeModel? RelatedCode { get; init; }

        public string NumberLabel => Number.ToString("00");
    }

    internal sealed class CodeGuidePdfRelatedCodeModel
    {
        public int StartLine { get; init; }
        public int EndLine { get; init; }
        public int? HighlightLine { get; init; }
        public List<CodeGuidePdfCodeLineModel> Lines { get; init; } = new();
    }

    internal sealed class CodeGuidePdfCodeLineModel
    {
        public int Number { get; init; }
        public string Content { get; init; } = string.Empty;
        public bool Highlight { get; init; }
    }
}
