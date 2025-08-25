namespace JobPortal.Domain.Common;

public abstract class AuditableEntity : AggregateRoot
{
    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; protected set; }
}
