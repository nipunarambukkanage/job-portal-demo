using System;

namespace JobPortal.Application.DTO.Notifications
{
    public class NotificationMessage
    {
        public string Type { get; set; } = "info"; // info|success|warning|error|custom
        public string Title { get; set; } = string.Empty;
        public string? Body { get; set; }
        public string? Entity { get; set; }    // e.g., "Job", "Application", "Organization"
        public string? EntityId { get; set; }  // GUID string or other id
        public object? Data { get; set; }      // Optional payload
        public DateTime AtUtc { get; set; } = DateTime.UtcNow;
    }
}
