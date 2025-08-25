using System;
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace JobPortal.Api.Configuration
{
    public static class SwaggerExtensions
    {
        private const string ApiTitle = "JobPortal API";
        private const string ApiVersion = "v1";
        private const string BearerScheme = "Bearer";

        /// <summary>
        /// Registers Swagger & OpenAPI with JWT Bearer support.
        /// </summary>
        public static IServiceCollection AddAppSwagger(this IServiceCollection services, IConfiguration _)
        {
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc(ApiVersion, new OpenApiInfo
                {
                    Title = ApiTitle,
                    Version = ApiVersion,
                    Description = "JobPortal HTTP API"
                });

                // JWT Bearer (Authorize button in Swagger)
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Enter JWT Bearer token **_only_**: `eyJhbGciOi...`",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = BearerScheme
                    }
                };
                c.AddSecurityDefinition(BearerScheme, securityScheme);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { securityScheme, Array.Empty<string>() }
                });

                // XML Comments (optional – enable GenerateDocumentationFile in .csproj)
                var xmlName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlName);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
                }

                // If you use [SwaggerOperation] etc., uncomment:
                // c.EnableAnnotations();
            });

            return services;
        }

        /// <summary>
        /// Enables Swagger UI. In production, you can gate with config if desired.
        /// </summary>
        public static WebApplication UseAppSwagger(this WebApplication app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.DocumentTitle = "JobPortal API - Swagger";
                c.SwaggerEndpoint($"/swagger/{ApiVersion}/swagger.json", $"{ApiTitle} {ApiVersion}");
                c.DisplayRequestDuration();
            });

            return app;
        }
    }
}
