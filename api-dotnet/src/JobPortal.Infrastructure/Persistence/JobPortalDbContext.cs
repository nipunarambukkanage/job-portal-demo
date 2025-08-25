using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Persistence;

public class JobPortalDbContext : DbContext
{
    public JobPortalDbContext(DbContextOptions<JobPortalDbContext> options) : base(options) { }

    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobApplication> Applications => Set<JobApplication>();
    public DbSet<Organization> Organizations => Set<Organization>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Job>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(140).IsRequired();
            e.Property(x => x.Location).HasMaxLength(100).IsRequired();
            e.Property(x => x.CreatedAtUtc).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            e.HasIndex(x => new { x.OrganizationId, x.CreatedAtUtc });
        });

        b.Entity<JobApplication>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.JobId, x.Status });
        });

        b.Entity<Organization>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
        });
    }
}
