using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Phases.DevNotes.AspNetCore.FileProviders;
using Phases.DevNotes.AspNetCore.Options;

namespace Phases.DevNotes.AspNetCore.Middleware
{
    /// <summary>
    /// Serves the DevNotes SPA shell as raw HTML (development only), without static file middleware,
    /// so the UI shell loads even when later pipeline components fail for other routes.
    /// </summary>
    internal sealed class DevNotesSafeUiMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly DevNotesEmbeddedAssets _assets;
        private readonly DevNotesOptions _options;

        public DevNotesSafeUiMiddleware(RequestDelegate next, DevNotesEmbeddedAssets assets, IOptions<DevNotesOptions> optionsAccessor)
        {
            _next = next;
            _assets = assets;
            _options = optionsAccessor.Value;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                if (!HttpMethods.IsGet(context.Request.Method))
                {
                    await _next(context);
                    return;
                }

                if (!IsSafeUiRequest(context.Request.Path, _options.SafeUiPath))
                {
                    await _next(context);
                    return;
                }

                var file = _assets.UiRoot.GetFileInfo("index.html");
                if (!file.Exists)
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                context.Response.ContentType = "text/html; charset=utf-8";
                await using var stream = file.CreateReadStream();
                await stream.CopyToAsync(context.Response.Body, context.RequestAborted);
            }
            catch
            {
                if (context.Response.HasStarted)
                {
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "text/plain; charset=utf-8";
                await context.Response.WriteAsync("DevNotes safe UI is unavailable.", context.RequestAborted);
            }
        }

        private static bool IsSafeUiRequest(PathString path, string safeUiPath)
        {
            var normalized = (path.Value ?? string.Empty).TrimEnd('/');
            var expected = (safeUiPath ?? string.Empty).TrimEnd('/');
            return string.Equals(normalized, expected, StringComparison.OrdinalIgnoreCase);
        }
    }
}
