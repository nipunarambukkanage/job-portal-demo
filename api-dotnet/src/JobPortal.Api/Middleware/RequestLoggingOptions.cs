namespace JobPortal.Api.Middleware
{
    public sealed class RequestLoggingOptions
    {
        /// <summary>Enable/disable the middleware quickly.</summary>
        public bool Enabled { get; set; } = true;

        /// <summary>Paths (prefix match) to exclude from logging (e.g., /health, /swagger).</summary>
        public string[] ExcludedPathPrefixes { get; set; } = new[] { "/health", "/swagger" };

        /// <summary>Log the request body (guarded by size/content type).</summary>
        public bool LogRequestBody { get; set; } = false;

        /// <summary>Log the response body (guarded by size/content type).</summary>
        public bool LogResponseBody { get; set; } = false;

        /// <summary>Max captured body bytes. Bodies larger than this are truncated.</summary>
        public int MaxBodyBytes { get; set; } = 16 * 1024; // 16 KB

        /// <summary>Only capture body for content types that start with these prefixes.</summary>
        public string[] AllowedBodyContentTypes { get; set; } = new[]
        {
            "application/json",
            "text/",
            "application/xml",
            "application/x-www-form-urlencoded"
        };

        /// <summary>Header names to redact (case-insensitive).</summary>
        public string[] RedactedHeaders { get; set; } = new[]
        {
            "Authorization", "Cookie", "Set-Cookie", "X-Api-Key"
        };
    }
}
