using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Orgs;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly JobPortalDbContext _db;
        public OrganizationRepository(JobPortalDbContext db) => _db = db;

        public Task<Organization?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, ct);

        public async Task<(IReadOnlyList<Organization> Items, int Total)> SearchAsync(OrgSearchRequest request, CancellationToken ct = default)
        {
            var query = _db.Organizations.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var q = request.Query.Trim();
                query = query.Where(o =>
                    EF.Functions.ILike(o.Name, $"%{q}%") ||
                    EF.Functions.ILike(o.Description ?? "", $"%{q}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.Location))
                query = query.Where(o => o.Location == request.Location);

            query = query.OrderByDescending(o => o.CreatedAtUtc);

            var total = await query.CountAsync(ct);
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return (items, total);
        }

        public Task AddAsync(Organization entity, CancellationToken ct = default)
            => _db.Organizations.AddAsync(entity, ct).AsTask();

        public void Update(Organization entity) => _db.Organizations.Update(entity);
        public void Remove(Organization entity) => _db.Organizations.Remove(entity);
    }
}
