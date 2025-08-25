using System;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Middleware
{
    /// <summary>
    /// Lightweight per-IP fixed-window rate limiter using IMemoryCache.
    /// Adds RFC-violating-but-useful headers widely used across APIs:
    ///   - X-RateLimit-Limit
    ///   - X-RateLimit-Remaining
    ///   - X-RateLimit-Reset (unix seconds)
    /// Also sets "Retry-After" on 429 responses.
    /// </summary>
    public sealed class RateLimitingMiddleware
    {
        private const string LimitHeader = "X-RateLimit-Limit";
        private const string RemainingHeader = "X-RateLimit-Remaining";
        private const string ResetHeader = "X-RateLimit-Reset";

        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingOptions _opts;

        public RateLimitingMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            IOptions<RateLimitingOptions> options,
            ILogger<RateLimitingMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _logger = logger;
            _opts = options.Value ?? new RateLimitingOptions();
        }

        public async Task Invoke(HttpContext ctx)
        {
            if (!_opts.Enabled || IsExcludedPath(ctx.Request.Path) || IsWhitelistedIp(GetClientIp(ctx)))
            {
                await _next(ctx);
                return;
            }

            var ip = GetClientIp(ctx) ?? "unknown";
            var window = TimeSpan.FromSeconds(Math.Max(1, _opts.WindowSeconds));
            var now = DateTimeOffset.UtcNow;
            var windowStart = new DateTimeOffset(now.Ticks - (now.Ticks % window.Ticks), TimeSpan.Zero);
            var windowEnd = windowStart.Add(window);

            // Key = "<ip>|<windowStartTicks>"
            var key = $"rl:{ip}:{windowStart.UtcTicks}";

            var entry = _cache.GetOrCreate(key, e =>
            {
                e.AbsoluteExpiration = windowEnd; // expire end-of-window
                return new Counter
                {
                    Count = 0,
                    WindowEnd = windowEnd
                };
            })!;

            entry.Count++;

            var remaining = Math.Max(0, _opts.RequestsPerWindow - entry.Count);
            var resetUnix = entry.WindowEnd.ToUnixTimeSeconds();

            // Always attach headers so clients can track usage.
            ctx.Response.OnStarting(() =>
            {
                ctx.Response.Headers[LimitHeader] = _opts.RequestsPerWindow.ToString();
                ctx.Response.Headers[RemainingHeader] = remaining.ToString();
                ctx.Response.Headers[ResetHeader] = resetUnix.ToString();
                return Task.CompletedTask;
            });

            if (entry.Count > _opts.RequestsPerWindow)
            {
                var retryAfter = Math.Max(0, (int)(entry.WindowEnd - now).TotalSeconds);
                _logger.LogWarning("Rate limit exceeded from IP {IP}. Limit={Limit}, WindowSeconds={WindowSeconds}", ip, _opts.RequestsPerWindow, _opts.WindowSeconds);

                ctx.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                ctx.Response.Headers["Retry-After"] = retryAfter.ToString();

                var problem = new ProblemDetails
                {
                    Title = "Too Many Requests",
                    Status = StatusCodes.Status429TooManyRequests,
                    Detail = $"Rate limit exceeded. Try again in {retryAfter} second(s).",
                    Instance = ctx.Request?.Path.Value
                };
                problem.Extensions["ip"] = ip;
                problem.Extensions["limit"] = _opts.RequestsPerWindow;
                problem.Extensions["windowSeconds"] = _opts.WindowSeconds;
                problem.Extensions["reset"] = resetUnix;
                var traceId = ctx.TraceIdentifier;
                if (!string.IsNullOrWhiteSpace(traceId)) problem.Extensions["traceId"] = traceId;

                await ctx.Response.WriteAsJsonAsync(problem);
                return;
            }

            await _next(ctx);
        }

        private bool IsExcludedPath(PathString path)
        {
            if (_opts.ExcludedPathPrefixes is null || _opts.ExcludedPathPrefixes.Length == 0)
                return false;

            var p = path.HasValue ? path.Value! : "/";
            return _opts.ExcludedPathPrefixes.Any(prefix =>
                !string.IsNullOrWhiteSpace(prefix) &&
                p.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        private bool IsWhitelistedIp(string? ip)
        {
            if (string.IsNullOrWhiteSpace(ip) || _opts.WhitelistIps is null || _opts.WhitelistIps.Length == 0)
                return false;

            return _opts.WhitelistIps.Any(w => string.Equals(w.Trim(), ip, StringComparison.OrdinalIgnoreCase));
        }

        private static string? GetClientIp(HttpContext ctx)
        {
            // Prefer X-Forwarded-For when behind proxies
            if (ctx.Request.Headers.TryGetValue("X-Forwarded-For", out var fwd) && fwd.Count > 0)
            {
                // Could be "client, proxy1, proxy2" → take first non-empty
                var first = fwd.ToString().Split(',').Select(s => s.Trim()).FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
                if (!string.IsNullOrWhiteSpace(first))
                    return first;
            }

            return ctx.Connection.RemoteIpAddress?.ToString();
        }

        private sealed class Counter
        {
            public int Count { get; set; }
            public DateTimeOffset WindowEnd { get; set; }
        }
    }
}
