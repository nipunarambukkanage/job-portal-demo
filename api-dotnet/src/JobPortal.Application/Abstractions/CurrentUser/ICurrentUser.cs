using System.Collections.Generic;

namespace JobPortal.Application.Abstractions.CurrentUser
{
    public interface ICurrentUser
    {
        bool IsAuthenticated { get; }
        string? UserId { get; }        // from "sub"
        string? Email { get; }         // from "email"
        string? Name { get; }          // "name" or first+last
        IEnumerable<string> Roles { get; }
        Dictionary<string, string[]> Claims { get; }

        bool IsInRole(string role);
        string? GetClaim(string claimType);
    }
}
