namespace Phases.DevNotes.AspNetCore.Models
{
    public class CodeGuidePdfExportRequest
    {
        /// <summary>
        /// One of: currentFile, selectedFiles, entireProject.
        /// </summary>
        public string Scope { get; set; } = "entireProject";

        /// <summary>
        /// Relative file paths included when Scope is currentFile or selectedFiles.
        /// </summary>
        public List<string> FilePaths { get; set; } = new();
    }
}
