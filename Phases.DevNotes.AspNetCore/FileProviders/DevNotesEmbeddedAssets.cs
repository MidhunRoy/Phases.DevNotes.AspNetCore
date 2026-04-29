using Microsoft.Extensions.FileProviders;

namespace Phases.DevNotes.AspNetCore.FileProviders
{
    /// <summary>
    /// Embedded UI files under wwwroot/devnotes (logical root for static middleware is this provider).
    /// </summary>
    internal sealed class DevNotesEmbeddedAssets
    {
        public IFileProvider UiRoot { get; }

        public DevNotesEmbeddedAssets()
        {
            var assembly = typeof(DevNotesEmbeddedAssets).Assembly;
            var manifest = new ManifestEmbeddedFileProvider(assembly, "wwwroot");
            UiRoot = new PrefixedFileProvider(manifest, "devnotes");
        }
    }
}
