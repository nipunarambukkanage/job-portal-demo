namespace JobPortal.Api.Middleware
{
    public sealed class RateLimitingOptions
    {
        public bool Enabled { get; set; } = true;
        public int RequestsPerWindow { get; set; } = 60;
        public int WindowSeconds { get; set; } = 60;
        public string[] ExcludedPathPrefixes { get; set; } = new[] { "/health", "/swagger" };
        public string[] WhitelistIps { get; set; } = new string[0];
    }
}
