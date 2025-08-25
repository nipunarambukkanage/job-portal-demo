using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories
{
    public class JobRepository : IJobRepository
    {
        private readonly JobPortalDbContext _db;
        public JobRepository(JobPortalDbContext db) => _db = db;

        public Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.Jobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == id, ct);

        public async Task<(IReadOnlyList<Job> Items, int Total)> SearchAsync(JobSearchRequest request, CancellationToken ct = default)
        {
            var query = _db.Jobs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var q = request.Query.Trim();
                query = query.Where(j =>
                    EF.Functions.ILike(j.Title, $"%{q}%") ||
                    EF.Functions.ILike(j.Description ?? "", $"%{q}%"));
            }

            if (request.OrganizationId.HasValue)
                query = query.Where(j => j.OrganizationId == request.OrganizationId);

            if (!string.IsNullOrWhiteSpace(request.Location))
                query = query.Where(j => j.Location == request.Location);

            if (!string.IsNullOrWhiteSpace(request.EmploymentType))
                query = query.Where(j => j.EmploymentType == request.EmploymentType);

            query = query.OrderByDescending(j => j.CreatedAtUtc);

            var total = await query.CountAsync(ct);
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return (items, total);
        }

        public Task AddAsync(Job entity, CancellationToken ct = default)
            => _db.Jobs.AddAsync(entity, ct).AsTask();

        public void Update(Job entity) => _db.Jobs.Update(entity);
        public void Remove(Job entity) => _db.Jobs.Remove(entity);
    }
}
