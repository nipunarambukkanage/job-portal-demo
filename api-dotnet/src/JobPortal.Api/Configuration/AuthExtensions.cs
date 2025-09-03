//using System;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Builder;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.IdentityModel.Tokens;
//using Microsoft.AspNetCore.Authentication.JwtBearer;

//namespace JobPortal.Api.Configuration
//{
//    public static class AuthExtensions
//    {
//        public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration config)
//        {
//            var issuer = config["Clerk:Issuer"] ?? "https://trusted-swan-44.clerk.accounts.dev";

//            var validAudiences = new[]
//            {
//                config["Clerk:Audience"] ?? "jobportal-api",
//                "http://localhost:5173",
//                "https://jobportal.nipunarambukkanage.dev"
//            };

//            var skewStr = config["Clerk:ClockSkewSeconds"];
//            var clockSkew = TimeSpan.FromSeconds(int.TryParse(skewStr, out var s) ? s : 5);

//            services
//                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//                .AddJwtBearer(options =>
//                {
//                    options.Authority = issuer;
//                    options.TokenValidationParameters = new TokenValidationParameters
//                    {
//                        ValidateIssuer = true,
//                        ValidIssuer = issuer,

//                        ValidateAudience = true,
//                        ValidAudiences = validAudiences,

//                        ValidateIssuerSigningKey = true,
//                        ValidateLifetime = true,
//                        ClockSkew = clockSkew,

//                        // Map Clerk custom claims
//                        NameClaimType = "sub",
//                        RoleClaimType = "org_role"
//                    };

//                    // For development/debugging
//                    options.Events = new JwtBearerEvents
//                    {
//                        OnAuthenticationFailed = context =>
//                        {
//                            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
//                            return Task.CompletedTask;
//                        },
//                        OnTokenValidated = context =>
//                        {
//                            Console.WriteLine("Token validated successfully");
//                            return Task.CompletedTask;
//                        }
//                    };
//                });

//            // ---- Authorization & org scoping ----
//            services.AddAuthorization(options =>
//            {
//                options.AddPolicy("OrgUser", policy =>
//                    policy.RequireAuthenticatedUser()
//                          .RequireClaim("org_id")
//                          .AddRequirements(new SameOrgRequirement()));

//                options.AddPolicy("AdminOnly", policy =>
//                    policy.RequireAuthenticatedUser()
//                          .RequireRole("admin")
//                          .RequireClaim("org_id")
//                          .AddRequirements(new SameOrgRequirement()));

//                options.AddPolicy("MemberOnly", policy =>
//                    policy.RequireAuthenticatedUser()
//                          .RequireRole("member")
//                          .RequireClaim("org_id")
//                          .AddRequirements(new SameOrgRequirement()));
//            });

//            services.AddSingleton<IAuthorizationHandler, SameOrgHandler>();

//            return services;
//        }

//        public static IApplicationBuilder UseAppAuthentication(this IApplicationBuilder app)
//        {
//            app.UseAuthentication();
//            app.UseAuthorization();
//            return app;
//        }
//    }

//    public sealed class SameOrgRequirement : IAuthorizationRequirement { }

//    public sealed class SameOrgHandler : AuthorizationHandler<SameOrgRequirement>
//    {
//        private readonly IConfiguration _config;
//        public SameOrgHandler(IConfiguration config) => _config = config;

//        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, SameOrgRequirement requirement)
//        {
//            var tokenOrg = context.User.FindFirst("org_id")?.Value;
//            var requiredOrg = _config["Clerk:OrgId"] ?? "org_324HWYiVx3PUVVPyHsjwOaOWSDl";

//            if (!string.IsNullOrWhiteSpace(tokenOrg) &&
//                (string.IsNullOrWhiteSpace(requiredOrg) || string.Equals(tokenOrg, requiredOrg, StringComparison.Ordinal)))
//            {
//                context.Succeed(requirement);
//            }

//            return Task.CompletedTask;
//        }
//    }
//}