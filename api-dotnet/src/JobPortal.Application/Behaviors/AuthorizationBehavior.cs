using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace JobPortal.Application.Behaviors
{
    /// <summary>
    /// Plug point for cross-cutting authorization checks.
    /// Add your own interfaces/requirements and verify them here.
    /// </summary>
    public sealed class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            // TODO: perform authorization checks (e.g., current user vs request)
            // Throw an appropriate exception if unauthorized/forbidden.
            return await next();
        }
    }
}
