using System;
using JobPortal.Api.Filters;
using JobPortal.Api.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace JobPortal.Api.Configuration
{
    /// <summary>
    /// Central place to register API-level services and map endpoints.
    /// Keep infra/app wiring in their own AddInfrastructure/AddApplication.
    /// </summary>
    public static class DependencyInjection
    {
        public const string CorsPolicyName = "AppCors";

        /// <summary>
        /// Registers controllers, ProblemDetails + global exception filter, Swagger, CORS, SignalR, Auth.
        /// Call from Program.cs: services.AddApiServices(configuration);
        /// </summary>
        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration config)
        {
            // Controllers + ProblemDetails + global exception filter
            services.AddProblemDetails();
            services.AddControllers(options =>
            {
                options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
                options.Filters.Add<ApiExceptionFilter>();
            });

            // Swagger (with JWT bearer support)
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "JobPortal API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header. Example: Bearer {token}",
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
                            Reference = new OpenApiReference
                            { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // CORS — read allowed origins from configuration: "Cors": { "Origins": [ ... ] }
            var origins = config.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
            services.AddCors(opt =>
            {
                opt.AddPolicy(CorsPolicyName, builder =>
                {
                    if (origins.Length > 0)
                    {
                        builder.WithOrigins(origins)
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                    else
                    {
                        // Fallback for local dev if not configured
                        builder.WithOrigins("http://localhost:5173")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                });
            });

            // Health checks (actual checks are added via your HealthChecksExtensions elsewhere)
            services.AddHealthChecks();

            // SignalR (Redis backplane is configured via AddAppSignalR in your other extension)
            services.AddSignalR();

            // Clerk JWT auth via your AuthExtensions
            services.AddAppAuthentication(config);

            return services;
        }

        /// <summary>
        /// Wires middleware pipeline + endpoint mappings.
        /// Call from Program.cs: app.UseApi();
        /// </summary>
        public static WebApplication UseApi(this WebApplication app)
        {
            var env = app.Environment;

            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // CORS before auth so preflight works with credentials
            app.UseCors(CorsPolicyName);

            // Auth
            app.UseAuthentication();
            app.UseAuthorization();

            // Controllers
            app.MapControllers();

            // Health endpoints
            app.MapHealthChecks("/health/live");
            app.MapHealthChecks("/health/ready");

            // SignalR hub endpoint
            app.MapHub<NotificationsHub>("/hubs/notifications");

            return app;
        }
    }
}
