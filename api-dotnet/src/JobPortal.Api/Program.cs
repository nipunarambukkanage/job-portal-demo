using JobPortal.Api.Configuration;
using JobPortal.Api.Filters;
using JobPortal.Api.Hubs;
using JobPortal.Api.Middleware;
using JobPortal.Api.Realtime;
using JobPortal.Application;
using JobPortal.Application.Abstractions.Messaging;
using JobPortal.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var env = builder.Environment;
var services = builder.Services;

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

services.AddProblemDetails();

services.AddScoped<ApiExceptionFilter>();
services.AddSingleton<ValidationProblemDetailsMapper>();

services.AddControllers(opt =>
{
    opt.Filters.Add<ApiExceptionFilter>();
});

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
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

services.AddCors(o => o.AddDefaultPolicy(p =>
{
    var origins = config.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" };
    p.WithOrigins(origins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials();
}));

services.AddSignalR();

services.AddApplication();
services.AddInfrastructure(config);

services.AddAppAuthentication(config);

services.AddAppHealthChecks(config);

services.AddAppOpenTelemetry(config, env);

services.AddRequestLogging(config);
services.AddAppRateLimiting(config);

services.AddSingleton<INotificationGateway, SignalRNotificationGateway>();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

app.UseCorrelationId();

app.UseHttpsRedirection();

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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JobPortal.Infrastructure.Persistence.JobPortalDbContext>();
    db.Database.Migrate();
}

app.Run();
