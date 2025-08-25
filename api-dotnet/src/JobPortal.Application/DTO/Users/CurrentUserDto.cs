using System.Collections.Generic;

namespace JobPortal.Application.DTO.Users
{
    public class CurrentUserDto
    {
        public string? UserId { get; set; }   // Clerk user id (from sub)
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string[] Roles { get; set; } = [];
        public Dictionary<string, string[]> Claims { get; set; } = new();
    }
}
