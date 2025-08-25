using System;
using Azure.Storage.Blobs;
using JobPortal.Application.Abstractions.Caching;
using JobPortal.Application.Abstractions.CurrentUser;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.Abstractions.Storage;
using JobPortal.Infrastructure.Caching;
using JobPortal.Infrastructure.Persistence;
using JobPortal.Infrastructure.Repositories;
using JobPortal.Infrastructure.Storage;
using JobPortal.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Trace;
using StackExchange.Redis;

namespace JobPortal.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            // Needed by CurrentUser (in Infrastructure.Security) to read HttpContext
            services.AddHttpContextAccessor();

            // --- Database (Postgres / Npgsql)
            var cs = config.GetConnectionString("Postgres")
                     ?? throw new InvalidOperationException("Missing Postgres connection string 'ConnectionStrings:Postgres'.");

            services.AddDbContext<JobPortalDbContext>(opt => opt.UseNpgsql(cs));

            // --- Repositories & UoW
            services.AddScoped<IJobRepository, JobRepository>();
            services.AddScoped<IApplicationRepository, ApplicationRepository>();
            services.AddScoped<IOrganizationRepository, OrganizationRepository>();
            services.AddScoped<IUnitOfWork, EfUnitOfWork>();

            // --- Current user accessor
            services.AddScoped<ICurrentUser, Infrastructure.Security.CurrentUser>();

            // --- Caching (Redis) — optional
            var redisUrl = config["Redis:Url"];
            if (!string.IsNullOrWhiteSpace(redisUrl))
            {
                services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisUrl));
                services.AddSingleton<ICacheService, RedisCacheService>();
            }

            // --- Blob storage (Azure) — optional
            var blobCs = config["Blob:ConnectionString"];
            if (!string.IsNullOrWhiteSpace(blobCs))
            {
                services.AddSingleton(new BlobServiceClient(blobCs));
                services.AddSingleton<IBlobStorage, AzureBlobStorageService>();
            }

            // --- OpenTelemetry (EF instrumentation + OTLP exporter)
            services.AddOpenTelemetry().WithTracing(b =>
            {
                b.AddEntityFrameworkCoreInstrumentation();
                b.AddOtlpExporter();
            });

            return services;
        }
    }
}
