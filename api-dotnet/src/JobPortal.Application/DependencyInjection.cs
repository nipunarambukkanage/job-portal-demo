using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using JobPortal.Application.Behaviors;

namespace JobPortal.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // MediatR v11 registration
            services.AddMediatR(assembly);

            // FluentValidation: scan this assembly
            services.AddValidatorsFromAssembly(assembly);

            // Pipeline behaviors (order: validation earliest)
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

            // AutoMapper: scan this assembly (profiles under JobPortal.Application.Mappings)
            services.AddAutoMapper(assembly);

            return services;
        }
    }
}
