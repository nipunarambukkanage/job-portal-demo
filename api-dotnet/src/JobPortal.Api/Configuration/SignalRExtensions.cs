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

            var redisUrl = config["Redis:Url"];
            if (!string.IsNullOrWhiteSpace(redisUrl))
            {
                signalR.AddStackExchangeRedis(redisUrl, options =>
                {
                    // TODO
                });
            }

            return services;
        }

        public static IApplicationBuilder UseAppSignalR(this IApplicationBuilder app)
        {
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<JobPortal.Api.Hubs.NotificationsHub>("/hubs/notifications");
            });

            return app;
        }
    }
}
