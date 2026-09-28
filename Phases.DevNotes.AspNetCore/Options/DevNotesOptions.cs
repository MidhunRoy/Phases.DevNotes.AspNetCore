namespace Phases.DevNotes.AspNetCore.Options
{
    public class DevNotesOptions
    {
        public const long DefaultMaxUploadSizeInBytes = 10 * 1024 * 1024;
        public const int DefaultScannerMaxFiles = 2000;
        public const long DefaultScannerMaxFileSizeBytes = 1024 * 1024;

        public static readonly string[] DefaultAllowedUploadExtensions =
        {
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp",
            ".pdf",
            ".txt",
            ".md",
            ".json"
        };

        public bool Enabled { get; set; } = true;
        public string RoutePrefix { get; set; } = "/devnotes";
        /// <summary>
        /// Development-only path that serves the SPA shell HTML directly (no static file middleware).
        /// </summary>
        public string SafeUiPath { get; set; } = "/devnotes-safe";
        public string DataFolderName { get; set; } = ".devnotes";
        public string UploadsFolderName { get; set; } = "uploads";
        public string DefaultCreatedBy { get; set; } = string.Empty;
        public long MaxUploadSizeInBytes { get; set; } = DefaultMaxUploadSizeInBytes;
        public string[] AllowedUploadExtensions { get; set; } = DefaultAllowedUploadExtensions;
        public bool EnableTodoScanner { get; set; } = true;
        public int ScannerMaxFiles { get; set; } = DefaultScannerMaxFiles;
        public long ScannerMaxFileSizeBytes { get; set; } = DefaultScannerMaxFileSizeBytes;
        [Obsolete("DevNotes is intentionally blocked outside Development.")]
        public bool EnableInNonDevelopment { get; set; } = false;
    }
}
