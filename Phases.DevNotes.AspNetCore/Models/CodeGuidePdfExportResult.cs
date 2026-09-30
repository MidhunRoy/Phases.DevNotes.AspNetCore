namespace Phases.DevNotes.AspNetCore.Models
{
    public sealed class CodeGuidePdfExportResult
    {
        public byte[]? PdfBytes { get; init; }
        public string FileName { get; init; } = "code-guide.pdf";
        public string? Error { get; init; }
        public int AnnotationCount { get; init; }
        public int FileCount { get; init; }

        public bool Success => PdfBytes is { Length: > 0 } && string.IsNullOrWhiteSpace(Error);

        public static CodeGuidePdfExportResult Fail(string error) =>
            new() { Error = error };

        public static CodeGuidePdfExportResult Ok(byte[] pdfBytes, string fileName, int annotationCount, int fileCount) =>
            new()
            {
                PdfBytes = pdfBytes,
                FileName = fileName,
                AnnotationCount = annotationCount,
                FileCount = fileCount
            };
    }
}
