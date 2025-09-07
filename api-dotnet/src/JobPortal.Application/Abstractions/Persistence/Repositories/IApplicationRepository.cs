// Application/Abstractions/Persistence/Repositories/IApplicationRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Abstractions.Persistence.Repositories
{
    public interface IApplicationRepository
    {
        Task<JobApplication?> GetByIdAsync(Guid id);
        Task<(IReadOnlyList<JobApplication> Items, int Total)> ListByJobAsync(Guid jobId, int page, int pageSize);
        Task<(IReadOnlyList<JobApplication> Items, int Total)> ListByCandidateAsync(Guid candidateId, int page, int pageSize);
        Task AddAsync(JobApplication entity);
        void Update(JobApplication entity);
        void Remove(JobApplication entity);
    }
}
