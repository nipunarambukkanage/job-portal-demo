using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Api.Middleware
{
    public static class RateLimitingExtensions
    {
        public static IServiceCollection AddAppRateLimiting(this IServiceCollection services, IConfiguration config)
        {
            services.AddMemoryCache();
            services.Configure<RateLimitingOptions>(config.GetSection("RateLimiting"));
            return services;
        }

        public static IApplicationBuilder UseAppRateLimiting(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RateLimitingMiddleware>();
        }
    }
}
