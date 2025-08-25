using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence;
using MediatR;

namespace JobPortal.Application.Behaviors;

public sealed class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IUnitOfWork _uow;
    public TransactionBehavior(IUnitOfWork uow) => _uow = uow;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        // If later add explicit transactions, use _uow here.
        var response = await next();
        return response;
    }
}
