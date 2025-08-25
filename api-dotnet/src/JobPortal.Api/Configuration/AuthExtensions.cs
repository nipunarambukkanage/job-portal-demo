using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace JobPortal.Api.Configuration
{
    /// <summary>
    /// Authentication/Authorization setup for Clerk (OIDC/JWT).
    /// Uses config keys:
    ///   Clerk:Issuer   (default: https://trusted-swan-44.clerk.accounts.dev)
    ///   Clerk:Audience (default: jobportal-api)
    ///   Clerk:ClockSkewSeconds (default: 5)
    /// </summary>
    public static class AuthExtensions
    {
        public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration config)
        {
            var issuer = config["Clerk:Issuer"] ?? "https://trusted-swan-44.clerk.accounts.dev";
            var audience = config["Clerk:Audience"] ?? "jobportal-api";
            var skewStr = config["Clerk:ClockSkewSeconds"];
            var clockSkew = TimeSpan.FromSeconds(int.TryParse(skewStr, out var s) ? s : 5);

            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = issuer;

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = issuer,

                        ValidateAudience = true,
                        ValidAudience = audience,
                        ValidateIssuerSigningKey = true,

                        ClockSkew = clockSkew,

                        ValidateLifetime = true,
                    };
                });

            return services;
        }

        /// <summary>
        /// Registers the auth middlewares. Call before mapping endpoints.
        /// </summary>
        public static IApplicationBuilder UseAppAuthentication(this IApplicationBuilder app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
            return app;
        }
    }
}
