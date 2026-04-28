using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Phases.DevNotes.AspNetCore.Models
{
    public class DevNote
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string Attachment { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string MethodName { get; set; } = string.Empty;
        public int? LineNumber { get; set; }

        public List<string> Tags { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
