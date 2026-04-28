using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Phases.DevNotes.AspNetCore.Services;
using Phases.DevNotes.AspNetCore.Middleware;
using Phases.DevNotes.AspNetCore.Options;

namespace Phases.DevNotes.AspNetCore.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseDevNotes(this IApplicationBuilder app)
        {
            ArgumentNullException.ThrowIfNull(app);

            var isService = app.ApplicationServices.GetService<IServiceProviderIsService>();
            if (isService is null || !isService.IsService(typeof(IDevNotesService)))
            {
                throw new InvalidOperationException("DevNotes is not registered. Call services.AddDevNotes() in Program.cs");
            }

            var env = app.ApplicationServices.GetRequiredService<IHostEnvironment>();
            var options = app.ApplicationServices.GetRequiredService<IOptions<DevNotesOptions>>().Value;
            var requestPath = new PathString(options.RoutePrefix);
            if (!env.IsDevelopment() || !options.Enabled)
            {
                app.Use(async (context, next) =>
                {
                    if (context.Request.Path.StartsWithSegments(requestPath, StringComparison.OrdinalIgnoreCase))
                    {
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        return;
                    }

                    await next();
                });

                return app;
            }

            var embeddedFiles = new ManifestEmbeddedFileProvider(typeof(ApplicationBuilderExtensions).Assembly, "wwwroot");
            var uploadsFolder = Path.Combine(env.ContentRootPath, options.DataFolderName, options.UploadsFolderName);
            Directory.CreateDirectory(uploadsFolder);

            app.Use(async (context, next) =>
            {
                if (context.Request.Path.Equals(requestPath, StringComparison.OrdinalIgnoreCase) ||
                    context.Request.Path.Equals($"{options.RoutePrefix}/", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.Redirect($"{options.RoutePrefix}/index.html", permanent: false);
                    return;
                }

                await next();
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedFiles,
                RequestPath = requestPath
            });
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uploadsFolder),
                RequestPath = $"{options.RoutePrefix}/uploads"
            });

            return app.UseMiddleware<DevNotesMiddleware>();
        }
    }
}
