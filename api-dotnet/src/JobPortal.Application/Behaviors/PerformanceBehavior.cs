using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Behaviors
{
    public sealed class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;

        private const long WarningThresholdMs = 500;

        public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken ct)
        {
            var sw = Stopwatch.StartNew();

            var response = await next();

            sw.Stop();
            if (sw.ElapsedMilliseconds > WarningThresholdMs)
            {
                _logger.LogWarning(
                    "Slow request {RequestName} took {Elapsed} ms (threshold {Threshold} ms)",
                    typeof(TRequest).Name,
                    sw.ElapsedMilliseconds,
                    WarningThresholdMs);
            }

            return response;
        }
    }
}
