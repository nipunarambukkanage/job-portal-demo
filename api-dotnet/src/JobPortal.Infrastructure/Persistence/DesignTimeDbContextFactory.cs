using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace JobPortal.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<JobPortalDbContext>
{
    public JobPortalDbContext CreateDbContext(string[] args)
    {
        var b = new DbContextOptionsBuilder<JobPortalDbContext>();
        b.UseNpgsql("Host=localhost;Database=jobportal;Username=postgres;Password=postgres");
        return new JobPortalDbContext(b.Options);
    }
}
