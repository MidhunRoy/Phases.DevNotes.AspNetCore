using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    public interface ICodePreviewService
    {
        CodePreviewResult GetPreview(string filePath, int? lineNumber);
    }
}
