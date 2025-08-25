using JobPortal.Domain.Common;

namespace JobPortal.Domain.Events;

public sealed record JobCreatedEvent(Guid JobId) : DomainEvent(DateTime.UtcNow);
