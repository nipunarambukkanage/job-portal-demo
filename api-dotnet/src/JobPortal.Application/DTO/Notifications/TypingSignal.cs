using System;

namespace JobPortal.Application.DTO.Notifications
{
    public class TypingSignal
    {
        public Guid OrgId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? Context { get; set; } // e.g., "job:123", "chat:abc"
        public DateTime AtUtc { get; set; }
    }
}