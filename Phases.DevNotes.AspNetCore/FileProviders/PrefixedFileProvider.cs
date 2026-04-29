using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;

namespace Phases.DevNotes.AspNetCore.FileProviders
{
    /// <summary>
    /// Maps a logical subfolder of an inner provider to the root seen by static files
    /// (e.g. embedded "devnotes/index.html" served under request path "/devnotes").
    /// </summary>
    internal sealed class PrefixedFileProvider : IFileProvider
    {
        private readonly IFileProvider _inner;
        private readonly string _prefix;

        public PrefixedFileProvider(IFileProvider inner, string prefix)
        {
            _inner = inner;
            _prefix = (prefix ?? string.Empty).Trim('/').Replace('\\', '/');
        }

        public IDirectoryContents GetDirectoryContents(string subpath)
        {
            return _inner.GetDirectoryContents(Combine(_prefix, subpath));
        }

        public IFileInfo GetFileInfo(string subpath)
        {
            return _inner.GetFileInfo(Combine(_prefix, subpath));
        }

        public IChangeToken Watch(string filter)
        {
            return _inner.Watch(Combine(_prefix, filter));
        }

        private static string Combine(string prefix, string? subpath)
        {
            var tail = (subpath ?? string.Empty).TrimStart('/').Replace('\\', '/');
            if (string.IsNullOrEmpty(prefix))
            {
                return tail;
            }

            return string.IsNullOrEmpty(tail) ? prefix : $"{prefix}/{tail}";
        }
    }
}
