using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using JobPortal.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Filters;

public sealed class ValidationProblemDetailsMapper
{
    public ValidationProblemDetails FromFluentValidation(ValidationException ex, HttpContext http)
    {
        var errors = ex.Errors
            .GroupBy(e => e.PropertyName ?? string.Empty)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        return Build(errors, http);
    }

    public ValidationProblemDetails FromDomainValidation(DomainValidationException ex, HttpContext http)
    {
        var list = ex.Errors ?? new List<DomainValidationException.DomainError>();
        var errors = list
            .GroupBy(e => e.PropertyName ?? string.Empty)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        return Build(errors, http);
    }

    private static ValidationProblemDetails Build(IDictionary<string, string[]> errorDict, HttpContext http)
    {
        var vpd = new ValidationProblemDetails(errorDict)
        {
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Instance = http.Request?.Path.Value
        };

        var traceId = http.TraceIdentifier;
        if (!string.IsNullOrWhiteSpace(traceId))
            vpd.Extensions["traceId"] = traceId;

        return vpd;
    }
}
