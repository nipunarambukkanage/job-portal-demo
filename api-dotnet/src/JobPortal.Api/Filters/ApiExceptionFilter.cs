using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using JobPortal.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JobPortal.Api.Filters;

public sealed class ApiExceptionFilter : IExceptionFilter
{
    private readonly ILogger<ApiExceptionFilter> _logger;
    private readonly IHostEnvironment _env;
    private readonly ValidationProblemDetailsMapper _validationMapper;

    public ApiExceptionFilter(
        ILogger<ApiExceptionFilter> logger,
        IHostEnvironment env,
        ValidationProblemDetailsMapper validationMapper)
    {
        _logger = logger;
        _env = env;
        _validationMapper = validationMapper;
    }

    public void OnException(ExceptionContext context)
    {
        var ex = context.Exception;
        var http = context.HttpContext;

        ProblemDetails problem;

        switch (ex)
        {
            case ValidationException fv:
                problem = _validationMapper.FromFluentValidation(fv, http);
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status400BadRequest };
                break;

            case DomainValidationException dv when dv.Errors is { Count: > 0 }:
                problem = _validationMapper.FromDomainValidation(dv, http);
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status400BadRequest };
                break;

            case KeyNotFoundException:
                problem = CreateProblem(http, StatusCodes.Status404NotFound, "Not Found", ex.Message);
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status404NotFound };
                break;

            case UnauthorizedAccessException:
                problem = CreateProblem(http, StatusCodes.Status403Forbidden, "Forbidden", ex.Message);
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status403Forbidden };
                break;

            case NotSupportedException:
                problem = CreateProblem(http, StatusCodes.Status400BadRequest, "Bad Request", ex.Message);
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status400BadRequest };
                break;

            default:
                _logger.LogError(ex, "Unhandled exception");
                problem = CreateProblem(
                    http,
                    StatusCodes.Status500InternalServerError,
                    "Internal Server Error",
                    _env.IsDevelopment() ? ex.ToString() : "An unexpected error occurred.");
                context.Result = new ObjectResult(problem) { StatusCode = StatusCodes.Status500InternalServerError };
                break;
        }

        context.ExceptionHandled = true;
    }

    private static ProblemDetails CreateProblem(HttpContext http, int status, string title, string? detail)
    {
        var pd = new ProblemDetails
        {
            Title = title,
            Status = status,
            Detail = detail,
            Instance = http.Request?.Path.Value
        };

        var traceId = http.TraceIdentifier;
        if (!string.IsNullOrWhiteSpace(traceId))
            pd.Extensions["traceId"] = traceId;

        return pd;
    }
}
