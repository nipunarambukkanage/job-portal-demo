using JobPortal.Api.Configuration;
using JobPortal.Api.Filters;
using JobPortal.Api.Hubs;
using JobPortal.Api.Middleware;
using JobPortal.Api.Realtime;
using JobPortal.Application;
using JobPortal.Application.Abstractions.Messaging;
using JobPortal.Infrastructure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var env = builder.Environment;
var services = builder.Services;

// Controllers + ProblemDetails + global exception filter
services.AddProblemDetails();
services.AddControllers(opt => opt.Filters.Add<ApiExceptionFilter>());

// Swagger (built-in, no custom extension)
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

// CORS
services.AddCors(o => o.AddDefaultPolicy(p =>
{
    var origins = config.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" };
    p.WithOrigins(origins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials();
}));

// SignalR
services.AddSignalR();

// Application & Infrastructure
services.AddApplication();
services.AddInfrastructure(config);

// Auth (Clerk JWT)
services.AddAppAuthentication(config);

// Health checks
services.AddAppHealthChecks(config);

// OpenTelemetry
services.AddAppOpenTelemetry(config, env);

// Middleware options
services.AddRequestLogging(config);
services.AddAppRateLimiting(config);

// Notifications gateway (SignalR hub)
services.AddSingleton<INotificationGateway, SignalRNotificationGateway>();

var app = builder.Build();

// Correlation Id
app.UseCorrelationId();

// Request logging
app.UseRequestLogging();

// HTTPS redirection
app.UseHttpsRedirection();

// CORS before auth
app.UseCors();

// Auth
app.UseAuthentication();
app.UseAuthorization();

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "JobPortal API v1");
});

// Endpoints
app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");

// Health endpoints
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = _ => true });

// Simple OK
app.MapGet("/health", () => Results.Ok("OK"));

// Rate limiting
app.UseAppRateLimiting();

app.Run();
