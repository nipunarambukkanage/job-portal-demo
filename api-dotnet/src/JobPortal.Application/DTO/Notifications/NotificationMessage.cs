using System;

namespace JobPortal.Application.DTO.Notifications
{
    public class NotificationMessage
    {
        public string Type { get; set; } = "info"; 
        public string Title { get; set; } = string.Empty;
        public string? Body { get; set; }
        public string? Entity { get; set; }    
        public string? EntityId { get; set; }  
        public object? Data { get; set; } 
        public DateTime AtUtc { get; set; } = DateTime.UtcNow;
    }
}
