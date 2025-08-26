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
    public static class DependencyInjection
    {
        public const string CorsPolicyName = "AppCors";

        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddProblemDetails();
            services.AddControllers(options =>
            {
                options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
                options.Filters.Add<ApiExceptionFilter>();
            });

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
                        builder.WithOrigins("http://localhost:5173")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    }
                });
            });

            services.AddHealthChecks();

            services.AddSignalR();

            services.AddAppAuthentication(config);

            return services;
        }

        public static WebApplication UseApi(this WebApplication app)
        {
            var env = app.Environment;

            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors(CorsPolicyName);
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
