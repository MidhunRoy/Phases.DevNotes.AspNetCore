namespace Phases.DevNotes.AspNetCore.Models
{
    public class DevNotesStats
    {
        public int TotalNotes { get; set; }
        public int BugCount { get; set; }
        public int IdeaCount { get; set; }
        public int TaskCount { get; set; }
        public int OtherCount { get; set; }
        public int ContributorCount { get; set; }
        public List<DevNotesContributorStat> TopContributors { get; set; } = new();
        public DateTime? LastUpdated { get; set; }
        public string? LastUpdatedBy { get; set; }
        public int TotalAttachments { get; set; }
    }
}
