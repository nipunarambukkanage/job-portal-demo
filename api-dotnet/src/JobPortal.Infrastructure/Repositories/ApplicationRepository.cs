using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories
{
    public class ApplicationRepository : IApplicationRepository
    {
        private readonly JobPortalDbContext _db;

        public ApplicationRepository(JobPortalDbContext db) => _db = db;

        public Task<JobApplication?> GetByIdAsync(Guid id)
            => _db.Applications.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

        public async Task<(IReadOnlyList<JobApplication> Items, int Total)> ListByJobAsync(Guid jobId, int page, int pageSize)
        {
            var query = _db.Applications.AsNoTracking().Where(a => a.JobId == jobId)
                        .OrderByDescending(a => a.CreatedAtUtc);

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, total);
        }

        public async Task AddAsync(JobApplication entity)
        {
            await _db.Applications.AddAsync(entity);
        }

        public void Update(JobApplication entity)
        {
            _db.Applications.Update(entity);
        }

        public void Remove(JobApplication entity)
        {
            _db.Applications.Remove(entity);
        }
    }
}
