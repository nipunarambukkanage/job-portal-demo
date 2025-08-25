using JobPortal.Domain.Common;

namespace JobPortal.Domain.Events;

public sealed record ApplicationSubmittedEvent(Guid ApplicationId) : DomainEvent(DateTime.UtcNow);
