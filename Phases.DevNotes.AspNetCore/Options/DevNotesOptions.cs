namespace Phases.DevNotes.AspNetCore.Options
{
    public class DevNotesOptions
    {
        public string RoutePrefix { get; set; } = "/devnotes";
        public string DataFolderName { get; set; } = ".devnotes";
        public string UploadsFolderName { get; set; } = "uploads";
        public bool EnableInNonDevelopment { get; set; } = false;
    }
}
