using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JobPortal.Api.Middleware
{
    /// <summary>
    /// Structured request/response logging with small body capture (optional).
    /// Works with CorrelationIdMiddleware via HttpContext.TraceIdentifier.
    /// </summary>
    public sealed class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private readonly RequestLoggingOptions _opts;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            ILogger<RequestLoggingMiddleware> logger,
            IOptions<RequestLoggingOptions> options)
        {
            _next = next;
            _logger = logger;
            _opts = options.Value ?? new RequestLoggingOptions();
        }

        public async Task Invoke(HttpContext ctx)
        {
            if (!_opts.Enabled || IsExcluded(ctx.Request.Path))
            {
                await _next(ctx);
                return;
            }

            var sw = Stopwatch.StartNew();

            // Capture request info early
            var req = ctx.Request;
            var method = req.Method;
            var path = req.Path.Value ?? "/";
            var query = req.QueryString.HasValue ? req.QueryString.Value : "";
            var traceId = ctx.TraceIdentifier;

            string? reqBody = null;
            if (_opts.LogRequestBody && BodyCaptureAllowed(req.ContentType))
            {
                req.EnableBuffering(); // allows reread
                reqBody = await ReadLimitedAsync(req.Body, _opts.MaxBodyBytes, req.ContentType);
                req.Body.Position = 0;
            }

            // Swap response body to capture it if needed
            var originalBody = ctx.Response.Body;
            using var buffer = new MemoryStream();
            if (_opts.LogResponseBody)
                ctx.Response.Body = buffer;

            try
            {
                await _next(ctx);
            }
            finally
            {
                sw.Stop();

                var status = ctx.Response.StatusCode;
                long? respLength = ctx.Response.ContentLength;
                string? respBody = null;

                if (_opts.LogResponseBody && BodyCaptureAllowed(ctx.Response.ContentType))
                {
                    // read buffer
                    ctx.Response.Body.Seek(0, SeekOrigin.Begin);
                    respBody = await ReadLimitedAsync(ctx.Response.Body, _opts.MaxBodyBytes, ctx.Response.ContentType);
                    ctx.Response.Body.Seek(0, SeekOrigin.Begin);

                    // copy back to real stream
                    await ctx.Response.Body.CopyToAsync(originalBody);
                }

                // Log with a scope that includes correlation id
                using (_logger.BeginScope(new System.Collections.Generic.Dictionary<string, object?>
                {
                    ["TraceId"] = traceId
                }))
                {
                    // Redact headers
                    var reqHeaders = RedactHeaders(req.Headers);
                    var respHeaders = RedactHeaders(ctx.Response.Headers);

                    if (_opts.LogRequestBody || _opts.LogResponseBody)
                    {
                        _logger.LogInformation(
                            "HTTP {Method} {Path}{Query} -> {Status} in {ElapsedMs} ms | reqLen={ReqLen} respLen={RespLen}",
                            method, path, query, status, sw.ElapsedMilliseconds,
                            req.ContentLength, respLength);

                        if (_opts.LogRequestBody && reqBody is not null)
                            _logger.LogDebug("RequestBody: {Body}", reqBody);

                        if (_opts.LogResponseBody && respBody is not null)
                            _logger.LogDebug("ResponseBody: {Body}", respBody);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "HTTP {Method} {Path}{Query} -> {Status} in {ElapsedMs} ms",
                            method, path, query, status, sw.ElapsedMilliseconds);
                    }

                    // Optionally log headers at Debug level
                    _logger.LogDebug("RequestHeaders: {Headers}", reqHeaders);
                    _logger.LogDebug("ResponseHeaders: {Headers}", respHeaders);
                }

                // restore original body stream if we swapped
                if (_opts.LogResponseBody)
                    ctx.Response.Body = originalBody;
            }
        }

        private bool IsExcluded(PathString path)
        {
            var p = path.HasValue ? path.Value! : "/";
            return _opts.ExcludedPathPrefixes != null &&
                   _opts.ExcludedPathPrefixes.Any(prefix =>
                       !string.IsNullOrWhiteSpace(prefix) &&
                       p.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        private bool BodyCaptureAllowed(string? contentType)
        {
            if (string.IsNullOrWhiteSpace(contentType) || _opts.AllowedBodyContentTypes is null)
                return false;

            foreach (var prefix in _opts.AllowedBodyContentTypes)
            {
                if (!string.IsNullOrWhiteSpace(prefix) &&
                    contentType.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        private static async Task<string> ReadLimitedAsync(Stream stream, int limitBytes, string? contentType)
        {
            const int bufferSize = 4096;
            var limit = Math.Max(1, limitBytes);
            var total = 0;

            using var ms = new MemoryStream();
            var buf = new byte[bufferSize];

            int read;
            while ((read = await stream.ReadAsync(buf, 0, Math.Min(buf.Length, limit - total))) > 0)
            {
                await ms.WriteAsync(buf.AsMemory(0, read));
                total += read;
                if (total >= limit) break;
            }

            var data = ms.ToArray();
            var text = TryDecodeText(data, contentType);
            if (total >= limit) text += $" …(truncated at {limit} bytes)";
            return text;
        }

        private static string TryDecodeText(byte[] data, string? contentType)
        {
            // naive charset sniff (utf-8 fallback)
            // you can enhance by parsing charset from contentType if needed
            try
            {
                return Encoding.UTF8.GetString(data);
            }
            catch
            {
                return $"[{data.Length} bytes binary]";
            }
        }

        private System.Collections.Generic.IDictionary<string, string> RedactHeaders(IHeaderDictionary headers)
        {
            var redacted = _opts.RedactedHeaders ?? Array.Empty<string>();
            var set = new System.Collections.Generic.HashSet<string>(redacted, StringComparer.OrdinalIgnoreCase);

            return headers.ToDictionary(
                kvp => kvp.Key,
                kvp => set.Contains(kvp.Key) ? "***REDACTED***" : string.Join(", ", kvp.Value),
                StringComparer.OrdinalIgnoreCase);
        }
    }
}
