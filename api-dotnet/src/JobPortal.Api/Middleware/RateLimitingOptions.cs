namespace JobPortal.Api.Middleware
{
    /// <summary>
    /// Basic fixed-window rate limit options.
    /// </summary>
    public sealed class RateLimitingOptions
    {
        /// <summary>
        /// Enable/disable middleware quickly without removing it.
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// Max requests per window from a single client (IP).
        /// </summary>
        public int RequestsPerWindow { get; set; } = 60;

        /// <summary>
        /// Window size in seconds (e.g., 60 = per minute).
        /// </summary>
        public int WindowSeconds { get; set; } = 60;

        /// <summary>
        /// Paths excluded from limiting (prefix match). Example: ["/health", "/swagger"].
        /// </summary>
        public string[] ExcludedPathPrefixes { get; set; } = new[] { "/health", "/swagger" };

        /// <summary>
        /// Optional list of IPs (exact string match) that are not limited (e.g., load balancer health IPs).
        /// </summary>
        public string[] WhitelistIps { get; set; } = new string[0];
    }
}
