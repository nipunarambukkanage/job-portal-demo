using Microsoft.AspNetCore.Builder;

namespace JobPortal.Api.Middleware
{
    public static class CorrelationIdExtensions
    {
        /// <summary>
        /// Registers the CorrelationIdMiddleware. Place it early in the pipeline
        /// (right after UseRouting or even before auth) so the ID flows everywhere.
        /// </summary>
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        {
            return app.UseMiddleware<CorrelationIdMiddleware>();
        }
    }
}
