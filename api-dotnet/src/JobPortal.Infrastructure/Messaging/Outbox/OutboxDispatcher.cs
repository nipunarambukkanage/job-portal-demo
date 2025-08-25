namespace JobPortal.Infrastructure.Messaging.Outbox;

public class OutboxDispatcher
{
    public Task DispatchAsync(CancellationToken ct = default) => Task.CompletedTask;
}
