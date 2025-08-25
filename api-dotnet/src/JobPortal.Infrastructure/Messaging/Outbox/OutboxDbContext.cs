using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Messaging.Outbox;

public class OutboxDbContext : DbContext
{
    public OutboxDbContext(DbContextOptions<OutboxDbContext> options) : base(options) { }
    public DbSet<OutboxMessage> Messages => Set<OutboxMessage>();
}
