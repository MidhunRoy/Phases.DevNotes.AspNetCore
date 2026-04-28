using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Phases.DevNotes.AspNetCore.Models;
using Phases.DevNotes.AspNetCore.Options;
using Phases.DevNotes.AspNetCore.Services;
using Phases.DevNotes.AspNetCore.Storage;

namespace Phases.DevNotes.AspNetCore.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDevNotes(this IServiceCollection services, Action<DevNotesOptions>? configure = null)
        {
            ArgumentNullException.ThrowIfNull(services);

            // Register options with defaults even when no custom configuration is provided.
            services.Configure<DevNotesOptions>(_ => { });
            if (configure is not null)
            {
                services.Configure(configure);
            }
            services.PostConfigure<DevNotesOptions>(options =>
            {
                options.RoutePrefix = NormalizeRoutePrefix(options.RoutePrefix);
                options.DataFolderName = string.IsNullOrWhiteSpace(options.DataFolderName) ? ".devnotes" : options.DataFolderName.Trim();
                options.UploadsFolderName = string.IsNullOrWhiteSpace(options.UploadsFolderName) ? "uploads" : options.UploadsFolderName.Trim();
                options.DefaultCreatedBy = options.DefaultCreatedBy?.Trim() ?? string.Empty;
            });

            services.TryAddSingleton<JsonStorageProvider<DevNote>>();
            services.TryAddScoped<IDevNotesService, DevNotesService>();

            return services;
        }

        private static string NormalizeRoutePrefix(string? routePrefix)
        {
            var value = string.IsNullOrWhiteSpace(routePrefix) ? "/devnotes" : routePrefix.Trim();
            if (!value.StartsWith('/'))
            {
                value = "/" + value;
            }

            return value.Length > 1 ? value.TrimEnd('/') : value;
        }
    }
}
