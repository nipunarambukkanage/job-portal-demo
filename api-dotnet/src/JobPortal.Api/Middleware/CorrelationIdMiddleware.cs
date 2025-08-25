using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace JobPortal.Api.Middleware
{
    /// <summary>
    /// Ensures every request has a correlation id.
    /// - Reads from "X-Correlation-ID" if provided, otherwise generates a new GUID (N format).
    /// - Sets HttpContext.TraceIdentifier for unified logging.
    /// - Adds the id to the response header and logging scope.
    /// - Adds an Activity tag for OpenTelemetry if Activity.Current exists.
    /// </summary>
    public sealed class CorrelationIdMiddleware
    {
        public const string HeaderName = "X-Correlation-ID";
        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            // 1) Read or create correlation id
            var correlationId = GetOrCreateCorrelationId(context);

            // 2) Set TraceIdentifier so all logs include it (most loggers capture this)
            context.TraceIdentifier = correlationId;

            // 3) Add to Activity for OTel
            var activity = Activity.Current;
            activity?.SetTag("correlation.id", correlationId);
            activity?.SetTag("http.request.id", correlationId);

            // 4) Put in HttpContext.Items for later retrieval
            context.Items[HeaderName] = correlationId;

            // 5) Add to response header (so clients can read it)
            context.Response.OnStarting(() =>
            {
                // Avoid duplicate header exceptions
                if (!context.Response.Headers.ContainsKey(HeaderName))
                    context.Response.Headers[HeaderName] = correlationId;

                return Task.CompletedTask;
            });

            // 6) Flow through with a logging scope that includes the id
            using (_logger.BeginScope("{CorrelationId}", correlationId))
            {
                await _next(context);
            }
        }

        private static string GetOrCreateCorrelationId(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue(HeaderName, out var values))
            {
                var raw = values.ToString()?.Trim();
                if (!string.IsNullOrWhiteSpace(raw))
                {
                    // Sanitize: limit size to avoid log/header abuse
                    return raw.Length <= 128 ? raw : raw.Substring(0, 128);
                }
            }

            return Guid.NewGuid().ToString("N"); // compact, URL-safe-ish
        }
    }

    public static class CorrelationIdHttpContextExtensions
    {
        /// <summary>Get the correlation id that this middleware assigned.</summary>
        public static string? GetCorrelationId(this HttpContext httpContext)
        {
            if (httpContext is null) return null;
            if (httpContext.Items.TryGetValue(CorrelationIdMiddleware.HeaderName, out var val) && val is string s)
                return s;

            // Fallbacks
            return httpContext.TraceIdentifier;
        }
    }
}
