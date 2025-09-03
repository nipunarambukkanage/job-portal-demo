using System;
using System.IO;
using JobPortal.Api.Configuration;
using JobPortal.Api.Filters;
using JobPortal.Api.Hubs;
using JobPortal.Api.Middleware;
using JobPortal.Api.Realtime;
using JobPortal.Application;
using JobPortal.Application.Abstractions.Messaging;
using JobPortal.Infrastructure;
using JobPortal.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var env = builder.Environment;
var services = builder.Services;

// Configuration
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ProblemDetails + Filters
services.AddProblemDetails();
services.AddScoped<ApiExceptionFilter>();
services.AddSingleton<ValidationProblemDetailsMapper>();

services.AddControllers(opt => { opt.Filters.Add<ApiExceptionFilter>(); });

// Swagger
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "JobPortal API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
var corsOrigins = config.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173", "https://jobportal.nipunarambukkanage.dev" };
services.AddCors(o => o.AddDefaultPolicy(p =>
{
    p.WithOrigins(corsOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials();
}));

// Realtime
services.AddSignalR();

// App layers / infra
services.AddApplication();
services.AddInfrastructure(config);

// Auth / Health / Telemetry / Logging / Rate limiting
services.AddAppAuthentication(config);
services.AddAppHealthChecks(config);
services.AddAppOpenTelemetry(config, env);
services.AddRequestLogging(config);
services.AddAppRateLimiting(config);

// Notifications
services.AddSingleton<INotificationGateway, SignalRNotificationGateway>();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// Pipeline
app.UseCorrelationId();


    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "JobPortal API v1");
    });

app.UseRouting();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.UseRequestLogging();
app.UseAppRateLimiting();

app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = _ => true });
app.MapGet("/health", () => Results.Ok("OK"));

var migrateOnStart = (Environment.GetEnvironmentVariable("MIGRATE_ON_START") ?? "false")
    .Equals("true", StringComparison.OrdinalIgnoreCase);

if (migrateOnStart)
{
    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
        .CreateLogger("DbMigration");

    var db = scope.ServiceProvider.GetRequiredService<JobPortalDbContext>();
    var conn = (NpgsqlConnection)db.Database.GetDbConnection();

    try
    {
        logger.LogInformation("Opening DB connection for migration...");
        conn.Open();

        using (var lockCmd = new NpgsqlCommand("SELECT pg_advisory_lock(88442211);", conn))
        {
            lockCmd.ExecuteNonQuery();
        }

        logger.LogInformation("Applying EF Core migrations...");
        db.Database.Migrate();
        logger.LogInformation("EF Core migrations completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error while applying EF Core migrations.");
        throw;
    }
    finally
    {
        try
        {
            using var unlockCmd = new NpgsqlCommand("SELECT pg_advisory_unlock(88442211);", conn);
            unlockCmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbMigration");
            log.LogWarning(ex, "Failed to release advisory lock (pg_advisory_unlock).");
        }

        conn.Close();
    }
}

app.Run();