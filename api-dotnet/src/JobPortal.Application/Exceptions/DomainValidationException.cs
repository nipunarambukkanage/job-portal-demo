using System;
using System.Collections.Generic;
using System.Linq;

namespace JobPortal.Application.Exceptions
{
    public sealed class DomainValidationException : Exception
    {
        public readonly record struct DomainError(string? PropertyName, string ErrorMessage);

        public IReadOnlyList<DomainError> Errors { get; }

        public DomainValidationException(string message)
            : base(message)
        {
            Errors = Array.Empty<DomainError>();
        }

        public DomainValidationException(IEnumerable<DomainError> errors)
            : this("One or more validation errors occurred.", errors)
        {
        }

        public DomainValidationException(string message, IEnumerable<DomainError> errors)
            : base(message)
        {
            Errors = (errors ?? Enumerable.Empty<DomainError>()).ToList();
        }
    }
}
