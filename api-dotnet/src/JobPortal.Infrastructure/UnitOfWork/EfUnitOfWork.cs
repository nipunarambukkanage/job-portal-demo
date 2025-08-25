using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Infrastructure.Persistence;

namespace JobPortal.Infrastructure.UnitOfWork
{
    public class EfUnitOfWork : IUnitOfWork
    {
        private readonly JobPortalDbContext _db;

        public EfUnitOfWork(JobPortalDbContext db) => _db = db;

        public Task<int> SaveChangesAsync(CancellationToken ct = default)
            => _db.SaveChangesAsync(ct);
    }
}
