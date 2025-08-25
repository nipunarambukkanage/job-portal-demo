using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using JobPortal.Application.Abstractions.CurrentUser;
using Microsoft.AspNetCore.Http;

namespace JobPortal.Infrastructure.Security
{
    public class CurrentUser : ICurrentUser
    {
        private readonly IHttpContextAccessor _http;

        public CurrentUser(IHttpContextAccessor http)
        {
            _http = http;
        }

        private ClaimsPrincipal? Principal => _http.HttpContext?.User;

        public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

        public string? UserId => GetClaim(ClaimTypes.NameIdentifier)
                                 ?? GetClaim("sub");

        public string? Email => GetClaim(ClaimTypes.Email)
                                 ?? GetClaim("email");

        public string? Name =>
            GetClaim("name")
            ?? (new[] { GetClaim("first_name"), GetClaim("last_name") }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Aggregate((a, b) => $"{a} {b}") ?? null);

        public IEnumerable<string> Roles =>
            Principal?.FindAll(ClaimTypes.Role).Select(c => c.Value)
            ?? Principal?.FindAll("roles").Select(c => c.Value)
            ?? Enumerable.Empty<string>();

        public Dictionary<string, string[]> Claims =>
            Principal?.Claims
                .GroupBy(c => c.Type)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Value).ToArray())
            ?? new();

        public bool IsInRole(string role) =>
            Roles.Contains(role, StringComparer.OrdinalIgnoreCase);

        public string? GetClaim(string claimType) =>
            Principal?.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
    }
}
