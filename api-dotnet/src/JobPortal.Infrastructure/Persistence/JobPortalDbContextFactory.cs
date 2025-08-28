using System;
using System.IO;
using JobPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

public class JobPortalDbContextFactory : IDesignTimeDbContextFactory<JobPortalDbContext>
{
    public JobPortalDbContext CreateDbContext(string[] args)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var current = Directory.GetCurrentDirectory();
        var apiDir = FindDirectoryUp(current, "JobPortal.Api")
                     ?? Path.Combine(current, "..", "JobPortal.Api");

        var cfgBuilder = new ConfigurationBuilder()
            .SetBasePath(apiDir)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddEnvironmentVariables();

        var config = cfgBuilder.Build();

        var cs =
            config.GetConnectionString("Postgres") ??
            Environment.GetEnvironmentVariable("POSTGRES") ??
            Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? throw new InvalidOperationException(
                "Design-time: missing Postgres connection. Add ConnectionStrings:Postgres in API appsettings/Secrets or set POSTGRES env var.");

        var options = new DbContextOptionsBuilder<JobPortalDbContext>()
            .UseNpgsql(cs, npg => npg.MigrationsAssembly(typeof(JobPortalDbContext).Assembly.FullName))
            .Options;

        return new JobPortalDbContext(options);
    }

    private static string? FindDirectoryUp(string start, string targetDirName)
    {
        var dir = new DirectoryInfo(start);
        while (dir != null)
        {
            var candidate = Path.Combine(dir.FullName, "src", targetDirName);
            if (Directory.Exists(candidate)) return candidate;

            candidate = Path.Combine(dir.FullName, targetDirName);
            if (Directory.Exists(candidate)) return candidate;

            dir = dir.Parent;
        }
        return null;
    }
}
