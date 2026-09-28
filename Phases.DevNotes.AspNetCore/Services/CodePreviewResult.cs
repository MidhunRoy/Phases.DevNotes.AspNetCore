using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    public sealed class CodePreviewResult
    {
        public CodePreview? Preview { get; init; }
        public string? Error { get; init; }

        public static CodePreviewResult Success(CodePreview preview) =>
            new() { Preview = preview };

        public static CodePreviewResult Fail(string error) =>
            new() { Error = error };
    }
}
