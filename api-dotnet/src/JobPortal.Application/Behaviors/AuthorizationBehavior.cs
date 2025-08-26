using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace JobPortal.Application.Behaviors
{
    public sealed class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            // TODO: perform authorization checks
            // Throws an appropriate exception if unauthorized/forbidden.
            return await next();
        }
    }
}
