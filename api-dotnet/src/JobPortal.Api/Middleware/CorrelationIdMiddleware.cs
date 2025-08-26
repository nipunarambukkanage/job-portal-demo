using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace JobPortal.Api.Middleware
{
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
            var correlationId = GetOrCreateCorrelationId(context);

            context.TraceIdentifier = correlationId;

            var activity = Activity.Current;
            activity?.SetTag("correlation.id", correlationId);
            activity?.SetTag("http.request.id", correlationId);

            context.Items[HeaderName] = correlationId;

            context.Response.OnStarting(() =>
            {
                if (!context.Response.Headers.ContainsKey(HeaderName))
                    context.Response.Headers[HeaderName] = correlationId;

                return Task.CompletedTask;
            });

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
                    return raw.Length <= 128 ? raw : raw.Substring(0, 128);
                }
            }

            return Guid.NewGuid().ToString("N"); 
        }
    }

    public static class CorrelationIdHttpContextExtensions
    {
        public static string? GetCorrelationId(this HttpContext httpContext)
        {
            if (httpContext is null) return null;
            if (httpContext.Items.TryGetValue(CorrelationIdMiddleware.HeaderName, out var val) && val is string s)
                return s;

            return httpContext.TraceIdentifier;
        }
    }
}
