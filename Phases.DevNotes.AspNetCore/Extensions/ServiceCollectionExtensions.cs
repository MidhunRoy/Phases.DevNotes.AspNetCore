using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Phases.DevNotes.AspNetCore.FileProviders;
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
                options.SafeUiPath = NormalizeSafeUiPath(options.SafeUiPath);
                options.DataFolderName = string.IsNullOrWhiteSpace(options.DataFolderName) ? ".devnotes" : options.DataFolderName.Trim();
                options.UploadsFolderName = string.IsNullOrWhiteSpace(options.UploadsFolderName) ? "uploads" : options.UploadsFolderName.Trim();
                options.DefaultCreatedBy = options.DefaultCreatedBy?.Trim() ?? string.Empty;

                if (options.MaxUploadSizeInBytes <= 0)
                {
                    options.MaxUploadSizeInBytes = DevNotesOptions.DefaultMaxUploadSizeInBytes;
                }

                if (options.ScannerMaxFiles <= 0)
                {
                    options.ScannerMaxFiles = DevNotesOptions.DefaultScannerMaxFiles;
                }

                if (options.ScannerMaxFileSizeBytes <= 0)
                {
                    options.ScannerMaxFileSizeBytes = DevNotesOptions.DefaultScannerMaxFileSizeBytes;
                }

                if (options.AllowedUploadExtensions is null || options.AllowedUploadExtensions.Length == 0)
                {
                    options.AllowedUploadExtensions = DevNotesOptions.DefaultAllowedUploadExtensions;
                }
                else
                {
                    options.AllowedUploadExtensions = options.AllowedUploadExtensions
                        .Select(NormalizeUploadExtension)
                        .Where(extension => !string.IsNullOrEmpty(extension))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToArray();
                }
            });

            services.TryAddSingleton<DevNotesEmbeddedAssets>();
            services.TryAddSingleton<JsonStorageProvider<DevNote>>();
            services.TryAddScoped<IDevNotesService, DevNotesService>();
            services.TryAddScoped<ICodePreviewService, CodePreviewService>();
            services.TryAddScoped<IDevNotesScannerService, DevNotesScannerService>();

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

        private static string NormalizeSafeUiPath(string? safeUiPath)
        {
            var value = string.IsNullOrWhiteSpace(safeUiPath) ? "/devnotes-safe" : safeUiPath.Trim();
            if (!value.StartsWith('/'))
            {
                value = "/" + value;
            }

            return value.Length > 1 ? value.TrimEnd('/') : value;
        }

        private static string NormalizeUploadExtension(string? extension)
        {
            if (string.IsNullOrWhiteSpace(extension))
            {
                return string.Empty;
            }

            var value = extension.Trim().ToLowerInvariant();
            if (!value.StartsWith('.'))
            {
                value = "." + value;
            }

            return value;
        }
    }
}
