using Microsoft.Extensions.Hosting;
using System.Text.Json;

namespace Phases.DevNotes.AspNetCore.Storage
{
    public class JsonStorageProvider<T> where T : class
    {
        private readonly string _filePath;
        private readonly object _sync = new();
        // Match API/middleware JSON (camelCase, case-insensitive read) so devnotes.json can be edited or copied from responses.
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
        {
            WriteIndented = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        };

        public JsonStorageProvider(IHostEnvironment env)
        {
            var folder = Path.Combine(env.ContentRootPath, ".devnotes");
            Directory.CreateDirectory(folder);

            _filePath = Path.Combine(folder, "devnotes.json");
            if (!File.Exists(_filePath))
            {
                File.WriteAllText(_filePath, "[]");
            }
        }

        public List<T> GetAll()
        {
            lock (_sync)
            {
                try
                {
                    var json = File.ReadAllText(_filePath);
                    if (string.IsNullOrWhiteSpace(json))
                    {
                        return new List<T>();
                    }

                    return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();
                }
                catch (JsonException)
                {
                    return new List<T>();
                }
                catch (IOException)
                {
                    return new List<T>();
                }
            }
        }

        public void Save(List<T> notes)
        {
            var data = notes ?? new List<T>();
            var json = JsonSerializer.Serialize(data, JsonOptions);

            lock (_sync)
            {
                var tempPath = _filePath + ".tmp";
                File.WriteAllText(tempPath, json);

                if (File.Exists(_filePath))
                {
                    File.Copy(tempPath, _filePath, overwrite: true);
                    File.Delete(tempPath);
                }
                else
                {
                    File.Move(tempPath, _filePath);
                }
            }
        }
    }
}
