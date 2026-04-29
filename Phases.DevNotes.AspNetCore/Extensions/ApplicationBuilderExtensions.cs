using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Phases.DevNotes.AspNetCore.FileProviders;
using Phases.DevNotes.AspNetCore.Middleware;
using Phases.DevNotes.AspNetCore.Options;
using Phases.DevNotes.AspNetCore.Services;

namespace Phases.DevNotes.AspNetCore.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseDevNotes(this IApplicationBuilder app)
        {
            ArgumentNullException.ThrowIfNull(app);

            var env = app.ApplicationServices.GetService<IHostEnvironment>();
            var optionsAccessor = app.ApplicationServices.GetService<IOptions<DevNotesOptions>>();

            // Fail-safe contract: if required services/options are unavailable, do nothing.
            if (env is null || optionsAccessor is null)
            {
                return app;
            }

            var options = optionsAccessor.Value;
            if (!env.IsDevelopment() || !options.Enabled)
            {
                // Production (or disabled): package should not affect host behavior.
                return app;
            }

            var routePrefix = new PathString(options.RoutePrefix);
            var safeUiPath = new PathString(options.SafeUiPath);
            var uploadsPath = $"{options.RoutePrefix}/uploads";
            var uploadsFolder = Path.Combine(env.ContentRootPath, options.DataFolderName, options.UploadsFolderName);
            Directory.CreateDirectory(uploadsFolder);

            app.MapWhen(
                context => IsDevNotesRequest(context.Request.Path, routePrefix, safeUiPath),
                branch =>
                {
                    // DevNotes route isolation: never bubble errors outside this branch.
                    branch.Use(async (context, next) =>
                    {
                        try
                        {
                            await next();
                        }
                        catch
                        {
                            if (context.Response.HasStarted)
                            {
                                return;
                            }

                            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                            context.Response.ContentType = "application/json; charset=utf-8";
                            await context.Response.WriteAsync("{\"error\":\"DevNotes unavailable.\"}", context.RequestAborted);
                        }
                    });

                    branch.Use(async (context, next) =>
                    {
                        if (context.Request.Path.Equals(routePrefix, StringComparison.OrdinalIgnoreCase) ||
                            context.Request.Path.Equals($"{options.RoutePrefix}/", StringComparison.OrdinalIgnoreCase))
                        {
                            context.Response.Redirect($"{options.RoutePrefix}/index.html", permanent: false);
                            return;
                        }

                        await next();
                    });

                    var embedded = branch.ApplicationServices.GetService<DevNotesEmbeddedAssets>();
                    if (embedded is null)
                    {
                        return;
                    }

                    branch.UseMiddleware<DevNotesSafeUiMiddleware>();
                    branch.UseStaticFiles(new StaticFileOptions
                    {
                        FileProvider = embedded.UiRoot,
                        RequestPath = routePrefix
                    });
                    branch.UseStaticFiles(new StaticFileOptions
                    {
                        FileProvider = new PhysicalFileProvider(uploadsFolder),
                        RequestPath = uploadsPath
                    });

                    var isService = branch.ApplicationServices.GetService<IServiceProviderIsService>();
                    if (isService is not null && isService.IsService(typeof(IDevNotesService)))
                    {
                        branch.UseMiddleware<DevNotesMiddleware>();
                    }
                });

            return app;
        }

        private static bool IsDevNotesRequest(PathString path, PathString routePrefix, PathString safeUiPath)
        {
            return path.StartsWithSegments(routePrefix, StringComparison.OrdinalIgnoreCase) ||
                   path.StartsWithSegments(safeUiPath, StringComparison.OrdinalIgnoreCase);
        }
    }
}
