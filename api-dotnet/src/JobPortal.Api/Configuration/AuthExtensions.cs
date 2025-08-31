using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace JobPortal.Api.Configuration
{
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
                    // Clerk OpenID issuer
                    options.Authority = issuer;
                    options.Audience = audience;

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = issuer,

                        ValidateAudience = true,
                        ValidAudience = audience,

                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        ClockSkew = clockSkew,

                        // map Clerk custom claims
                        NameClaimType = "sub",
                        RoleClaimType = "org_role"
                    };
                });

            // ---- Authorization & org scoping ----
            services.AddAuthorization(options =>
            {
                options.AddPolicy("OrgUser", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireClaim("org_id")
                          .AddRequirements(new SameOrgRequirement()));

                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireRole("admin")
                          .RequireClaim("org_id")
                          .AddRequirements(new SameOrgRequirement()));

                options.AddPolicy("MemberOnly", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireRole("member")
                          .RequireClaim("org_id")
                          .AddRequirements(new SameOrgRequirement()));
            });

            services.AddSingleton<IAuthorizationHandler, SameOrgHandler>();

            return services;
        }

        public static IApplicationBuilder UseAppAuthentication(this IApplicationBuilder app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
            return app;
        }
    }

    // Require user to belong to the configured Clerk organization (if set).
    public sealed class SameOrgRequirement : IAuthorizationRequirement { }

    public sealed class SameOrgHandler : AuthorizationHandler<SameOrgRequirement>
    {
        private readonly IConfiguration _config;
        public SameOrgHandler(IConfiguration config) => _config = config;

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, SameOrgRequirement requirement)
        {
            var tokenOrg = context.User.FindFirst("org_id")?.Value;
            // Prefer appsettings: Clerk:OrgId; allow env override CLERK_ORG_ID
            var requiredOrg = "org_324HWYiVx3PUVVPyHsjwOaOWSDl"; //TODO; Move to env variables. This is only for testing purposes

            if (!string.IsNullOrWhiteSpace(tokenOrg) &&
                (string.IsNullOrWhiteSpace(requiredOrg) || string.Equals(tokenOrg, requiredOrg, StringComparison.Ordinal)))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
