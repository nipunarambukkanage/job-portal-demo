// Infrastructure/Repositories/ApplicationRepository.cs
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Applications;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobPortal.Infrastructure.Repositories
{
    public class ApplicationRepository : IApplicationRepository
    {
        private readonly JobPortalDbContext _db;

        public ApplicationRepository(JobPortalDbContext db) => _db = db;

        public Task<JobApplication?> GetByIdAsync(Guid id)
            => _db.Applications.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

        public async Task<(IReadOnlyList<ApplicationDto> Items, int Total)> ListWithJobAsync(
            Guid? jobId, Guid? candidateId, int page, int pageSize)
        {
            var baseQuery =
                from a in _db.Applications.AsNoTracking()
                join j in _db.Jobs.AsNoTracking() on a.JobId equals j.Id
                select new { a, j };

            if (jobId.HasValue && jobId.Value != Guid.Empty)
                baseQuery = baseQuery.Where(x => x.a.JobId == jobId.Value);

            if (candidateId.HasValue && candidateId.Value != Guid.Empty)
                baseQuery = baseQuery.Where(x => x.a.CandidateId == candidateId.Value);

            var total = await baseQuery.CountAsync();

            var items = await baseQuery
                .OrderByDescending(x => x.a.CreatedAtUtc)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ApplicationDto
                {
                    Id = x.a.Id,
                    JobId = x.a.JobId,
                    CandidateId = x.a.CandidateId,
                    CoverLetter = x.a.CoverLetter,
                    ResumeUrl = x.a.ResumeUrl,
                    Status = x.a.Status,
                    CreatedAtUtc = x.a.CreatedAtUtc,
                    UpdatedAtUtc = x.a.UpdatedAtUtc,
                    Job = new JobSummaryDto
                    {
                        Id = x.j.Id,
                        Title = x.j.Title,
                        Company = "Nipuna Rambukkanage (Pvt) Ltd",
                        Location = x.j.Location ?? "Colombo"
                    }
                })
                .ToListAsync();

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
