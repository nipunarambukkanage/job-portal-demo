using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace JobPortal.Api.Configuration
{
    public static class SignalRExtensions
    {
        public static IServiceCollection AddAppSignalR(this IServiceCollection services, IConfiguration config)
        {
            var signalR = services.AddSignalR();

            // Optional: Redis backplane if Redis:Url exists (StackExchange.Redis)
            // Example Redis: "redis-xxxx.redns.redis-cloud.com:12427,password=...,ssl=True,abortConnect=False"
            var redisUrl = config["Redis:Url"];
            if (!string.IsNullOrWhiteSpace(redisUrl))
            {
                signalR.AddStackExchangeRedis(redisUrl, options =>
                {
                    // defaults are fine for most cases
                });
            }

            return services;
        }

        public static IApplicationBuilder UseAppSignalR(this IApplicationBuilder app)
        {
            // Map hub endpoints (keep path stable for your frontend)
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<JobPortal.Api.Hubs.NotificationsHub>("/hubs/notifications");
            });

            return app;
        }
    }
}
