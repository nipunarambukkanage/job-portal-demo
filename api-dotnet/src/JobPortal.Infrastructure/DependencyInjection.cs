using System;
using System.IO;
using System.Text.RegularExpressions;
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
            services.AddHttpContextAccessor();

            // ---- Postgres connection resolution (robust) ----
            var cs =
                config.GetConnectionString("Postgres") // appsettings / user-secrets
                ?? Environment.GetEnvironmentVariable("POSTGRES") // plain env var
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__Postgres") // ASP.NET env mapping
                ?? FromUrl(Environment.GetEnvironmentVariable("DATABASE_URL")) // e.g., postgres://...
                ?? FromUrl(Environment.GetEnvironmentVariable("POSTGRES_URL"))
                ?? throw new InvalidOperationException(
                    "Missing Postgres connection. Provide ConnectionStrings:Postgres (appsettings or user-secrets) " +
                    "or set env var POSTGRES / ConnectionStrings__Postgres, or DATABASE_URL/POSTGRES_URL.");

            services.AddDbContext<JobPortalDbContext>(opt =>
            {
                opt.UseNpgsql(cs, npg =>
                {
                    // Make sure EF knows where migrations live:
                    npg.MigrationsAssembly(typeof(JobPortalDbContext).Assembly.FullName);
                    // Optional: custom history table
                    // npg.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                });
            });

            // Repositories & UoW
            services.AddScoped<IJobRepository, JobRepository>();
            services.AddScoped<IApplicationRepository, ApplicationRepository>();
            services.AddScoped<IOrganizationRepository, OrganizationRepository>();
            services.AddScoped<IUnitOfWork, EfUnitOfWork>();

            // Current user accessor
            services.AddScoped<ICurrentUser, Infrastructure.Security.CurrentUser>();

            // Caching (Redis)
            var redisUrl = config["Redis:Url"] ?? Environment.GetEnvironmentVariable("REDIS_URL");
            if (!string.IsNullOrWhiteSpace(redisUrl))
            {
                services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisUrl));
                services.AddSingleton<ICacheService, RedisCacheService>();
            }

            // Blob storage (Azure)
            var blobCs = config["Blob:ConnectionString"] ?? Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING");
            if (!string.IsNullOrWhiteSpace(blobCs))
            {
                services.AddSingleton(new BlobServiceClient(blobCs));
                services.AddSingleton<IBlobStorage, AzureBlobStorageService>();
            }

            // OpenTelemetry (safe defaults)
            services.AddOpenTelemetry().WithTracing(b =>
            {
                b.AddEntityFrameworkCoreInstrumentation();
                // If OTLP endpoint isn�t set, this no-ops gracefully
                b.AddOtlpExporter();
            });

            return services;
        }

        // Converts postgres://user:pass@host:port/db?sslmode=require to Npgsql format
        private static string? FromUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;
            // Accept both postgres:// and postgresql://
            var m = Regex.Match(url,
                @"^(postgres(?:ql)?):\/\/(?<user>[^:\/?#]+)(?::(?<pass>[^@\/?#]*))?@(?<host>[^:\/?#]+)(?::(?<port>\d+))?\/(?<db>[^\/?#]+)(?:\?(?<query>.*))?$",
                RegexOptions.IgnoreCase);
            if (!m.Success) return null;

            var user = Uri.UnescapeDataString(m.Groups["user"].Value);
            var pass = Uri.UnescapeDataString(m.Groups["pass"].Value);
            var host = m.Groups["host"].Value;
            var port = string.IsNullOrEmpty(m.Groups["port"].Value) ? "5432" : m.Groups["port"].Value;
            var db = m.Groups["db"].Value;
            var query = m.Groups["query"].Value; // e.g., sslmode=require

            // Map common query params if present
            var sslMode = "Require";
            var trust = "true";
            if (!string.IsNullOrWhiteSpace(query))
            {
                var qp = System.Web.HttpUtility.ParseQueryString(query);
                sslMode = qp["sslmode"]?.Equals("disable", StringComparison.OrdinalIgnoreCase) == true ? "Disable" : "Require";
            }

            return $"Host={host};Port={port};Database={db};Username={user};Password={pass};Ssl Mode={sslMode};Trust Server Certificate={trust}";
        }
    }
}
