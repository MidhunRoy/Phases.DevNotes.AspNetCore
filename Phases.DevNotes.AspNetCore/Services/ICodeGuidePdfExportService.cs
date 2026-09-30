using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    public interface ICodeGuidePdfExportService
    {
        CodeGuidePdfExportResult Export(CodeGuidePdfExportRequest request);
    }
}
