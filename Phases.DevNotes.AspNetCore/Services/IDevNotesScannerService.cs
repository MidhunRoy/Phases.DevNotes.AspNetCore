using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    public interface IDevNotesScannerService
    {
        ScanResult Scan();
        ScanImportResult Import(IReadOnlyList<ScannedNote> notes, string? createdBy = null);
    }
}
