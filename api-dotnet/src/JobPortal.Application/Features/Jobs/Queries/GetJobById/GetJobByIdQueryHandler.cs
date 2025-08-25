using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Jobs.Queries.GetJobById
{
    public sealed class GetJobByIdQueryHandler : IRequestHandler<GetJobByIdQuery, JobDto?>
    {
        private readonly IJobRepository _repo;

        public GetJobByIdQueryHandler(IJobRepository repo) => _repo = repo;

        public async Task<JobDto?> Handle(GetJobByIdQuery request, CancellationToken ct)
        {
            var job = await _repo.GetByIdAsync(request.Id, ct);
            if (job is null) return null;

            return new JobDto
            {
                Id = job.Id,
                OrganizationId = job.OrganizationId,
                Title = job.Title,
                Description = job.Description,
                Location = job.Location,
                EmploymentType = job.EmploymentType,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                CreatedAtUtc = job.CreatedAtUtc,
                UpdatedAtUtc = job.UpdatedAtUtc
            };
        }
    }
}
