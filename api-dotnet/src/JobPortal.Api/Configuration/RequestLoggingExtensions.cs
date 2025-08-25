using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Api.Middleware
{
    public static class RequestLoggingExtensions
    {
        public static IServiceCollection AddRequestLogging(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<RequestLoggingOptions>(config.GetSection("RequestLogging"));
            return services;
        }

        /// <summary>Place early (after correlation id) so downstream logs share the same TraceIdentifier.</summary>
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
