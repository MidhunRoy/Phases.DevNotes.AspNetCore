using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    public interface IDevNotesService
    {
        List<DevNote> GetAll();
        (int Total, List<DevNote> Items) Search(string? search, string? type, string? sort, int page, int pageSize);
        void Add(DevNote note);
        DevNote? Update(Guid id, DevNote updatedNote);
        bool Delete(Guid id);
    }
}
