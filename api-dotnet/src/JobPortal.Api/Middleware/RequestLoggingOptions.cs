namespace JobPortal.Api.Middleware
{
    public sealed class RequestLoggingOptions
    {
        public bool Enabled { get; set; } = true;
        public string[] ExcludedPathPrefixes { get; set; } = new[] { "/health", "/swagger" };
        public bool LogRequestBody { get; set; } = false;
        public bool LogResponseBody { get; set; } = false;
        public int MaxBodyBytes { get; set; } = 16 * 1024; // 16 KB
        public string[] AllowedBodyContentTypes { get; set; } = new[]
        {
            "application/json",
            "text/",
            "application/xml",
            "application/x-www-form-urlencoded"
        };
        public string[] RedactedHeaders { get; set; } = new[]
        {
            "Authorization", "Cookie", "Set-Cookie", "X-Api-Key"
        };
    }
}
