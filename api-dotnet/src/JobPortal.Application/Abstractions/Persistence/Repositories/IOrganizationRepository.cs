using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.DTO.Orgs;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Abstractions.Persistence.Repositories
{
    public interface IOrganizationRepository
    {
        Task<Organization?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<(IReadOnlyList<Organization> Items, int Total)> SearchAsync(OrgSearchRequest request, CancellationToken ct = default);
        Task AddAsync(Organization entity, CancellationToken ct = default);
        void Update(Organization entity);
        void Remove(Organization entity);
    }
}
