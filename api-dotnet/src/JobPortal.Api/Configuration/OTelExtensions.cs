using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

namespace JobPortal.Api.Configuration
{
    public static class OTelExtensions
    {
        public static IServiceCollection AddAppOpenTelemetry(this IServiceCollection services, IConfiguration config, IHostEnvironment env)
        {
            var serviceName = config.GetValue<string>("OTel:ServiceName") ?? env.ApplicationName;
            var serviceVersion = config.GetValue<string>("OTel:ServiceVersion") ?? "1.0.0";
            var otlpEndpoint = config.GetValue<string>("OTel:OtlpEndpoint");

            services.AddOpenTelemetry()
                .ConfigureResource(r => r.AddService(serviceName, serviceVersion, Environment.MachineName))
                .WithTracing(tracing =>
                {
                    tracing.AddAspNetCoreInstrumentation(opt =>
                    {
                        opt.RecordException = true;
                        opt.Filter = ctx => ctx.Request.Path != "/health/live";
                    });

                    tracing.AddHttpClientInstrumentation();
                    tracing.AddEntityFrameworkCoreInstrumentation();

                    if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                        tracing.AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint));
                    else
                        tracing.AddConsoleExporter();
                })
                .WithMetrics(metrics =>
                {
                    metrics.AddAspNetCoreInstrumentation();
                    metrics.AddHttpClientInstrumentation();
                    metrics.AddRuntimeInstrumentation();

                    if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                        metrics.AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint));
                    else
                        metrics.AddConsoleExporter();
                });

            return services;
        }

        public static ILoggingBuilder AddAppOpenTelemetryLogging(this ILoggingBuilder logging, IConfiguration config)
        {
            var otlpEndpoint = config.GetValue<string>("OTel:OtlpEndpoint");

            logging.AddOpenTelemetry(o =>
            {
                o.IncludeFormattedMessage = true;
                o.IncludeScopes = true;

                if (!string.IsNullOrWhiteSpace(otlpEndpoint))
                    o.AddOtlpExporter(opt => opt.Endpoint = new Uri(otlpEndpoint));
                else
                    o.AddConsoleExporter();
            });

            return logging;
        }
    }
}
