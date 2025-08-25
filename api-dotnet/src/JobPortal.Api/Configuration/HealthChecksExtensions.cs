using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace JobPortal.Api.Configuration
{
    public static class HealthChecksExtensions
    {
        public static IServiceCollection AddAppHealthChecks(this IServiceCollection services, IConfiguration config)
        {
            var hcBuilder = services.AddHealthChecks();

            var postgres = config.GetConnectionString("Postgres");
            if (!string.IsNullOrWhiteSpace(postgres))
            {
                hcBuilder.AddNpgSql(postgres, name: "postgresql", failureStatus: HealthStatus.Unhealthy);
            }

            var redis = config.GetSection("Redis:Url").Value;
            if (!string.IsNullOrWhiteSpace(redis))
            {
                hcBuilder.AddRedis(redis, name: "redis", failureStatus: HealthStatus.Unhealthy);
            }

            var blob = config.GetSection("Blob:ConnectionString").Value;
            if (!string.IsNullOrWhiteSpace(blob))
            {
                hcBuilder.AddAzureBlobStorage(blob, name: "azureblob", failureStatus: HealthStatus.Unhealthy);
            }

            return services;
        }

        public static WebApplication UseAppHealthChecks(this WebApplication app)
        {
            app.MapHealthChecks("/health/live");
            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = _ => true
            });
            return app;
        }
    }
}
