namespace Phases.DevNotes.AspNetCore.Options
{
    public class DevNotesOptions
    {
        public bool Enabled { get; set; } = true;
        public string RoutePrefix { get; set; } = "/devnotes";
        /// <summary>
        /// Development-only path that serves the SPA shell HTML directly (no static file middleware).
        /// </summary>
        public string SafeUiPath { get; set; } = "/devnotes-safe";
        public string DataFolderName { get; set; } = ".devnotes";
        public string UploadsFolderName { get; set; } = "uploads";
        public string DefaultCreatedBy { get; set; } = string.Empty;
        [Obsolete("DevNotes is intentionally blocked outside Development.")]
        public bool EnableInNonDevelopment { get; set; } = false;
    }
}
