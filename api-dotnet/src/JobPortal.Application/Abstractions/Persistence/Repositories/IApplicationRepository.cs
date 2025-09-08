// Application/Abstractions/Persistence/Repositories/IApplicationRepository.cs
using JobPortal.Application.DTO.Applications;
using JobPortal.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobPortal.Application.Abstractions.Persistence.Repositories
{
    public interface IApplicationRepository
    {
        Task<JobApplication?> GetByIdAsync(Guid id);
        Task<(IReadOnlyList<ApplicationDto> Items, int Total)> ListWithJobAsync(
    Guid? jobId, Guid? candidateId, int page, int pageSize);
        Task AddAsync(JobApplication entity);
        void Update(JobApplication entity);
        void Remove(JobApplication entity);
    }
}
