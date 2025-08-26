using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Behaviors
{
    public sealed class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            var reqName = typeof(TRequest).Name;
            _logger.LogInformation("Handling {RequestName}", reqName);

            try
            {
                var response = await next();

                _logger.LogInformation("Handled {RequestName}", reqName);
                return response;
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                _logger.LogWarning("Request {RequestName} was cancelled", reqName);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling {RequestName}", reqName);
                throw;
            }
        }
    }
}
