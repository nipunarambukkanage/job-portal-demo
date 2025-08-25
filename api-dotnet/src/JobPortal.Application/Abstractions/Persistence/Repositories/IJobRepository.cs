using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Abstractions.Persistence.Repositories
{
    public interface IJobRepository
    {
        Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<(IReadOnlyList<Job> Items, int Total)> SearchAsync(JobSearchRequest request, CancellationToken ct = default);
        Task AddAsync(Job entity, CancellationToken ct = default);
        void Update(Job entity);
        void Remove(Job entity);
    }
}
