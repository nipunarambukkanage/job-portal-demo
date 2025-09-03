using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Domain.Entities;

namespace JobPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class JobsController : ControllerBase
    {
        private readonly IJobRepository _repo;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public JobsController(IJobRepository repo, IUnitOfWork uow, IMapper mapper)
        {
            _repo = repo;
            _uow = uow;
            _mapper = mapper;
        }

        [HttpPost]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<JobDto>> Create([FromBody] CreateJobRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = _mapper.Map<Job>(request);
            entity.Id = Guid.NewGuid();
            entity.CreatedAtUtc = DateTime.UtcNow;
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _repo.AddAsync(entity);
            await _uow.SaveChangesAsync();

            var dto = _mapper.Map<JobDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        [HttpGet("{id:guid}")]
        //[Authorize(Policy = "OrgUser")]
        public async Task<ActionResult<JobDto>> GetById(Guid id)
        {
            var job = await _repo.GetByIdAsync(id);
            if (job is null) return NotFound();
            return Ok(_mapper.Map<JobDto>(job));
        }

        // Members can browse/search jobs (internal portal)
        [HttpGet]
        //[Authorize(Policy = "OrgUser")]
        public async Task<ActionResult<PagedJobsResponse>> Search(
            [FromQuery] string? q,
            [FromQuery] Guid? orgId,
            [FromQuery] string? location,
            [FromQuery] string? employmentType,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _repo.SearchAsync(new JobSearchRequest
            {
                Query = q,
                OrganizationId = orgId,
                Location = location,
                EmploymentType = employmentType,
                Page = page,
                PageSize = pageSize
            });

            return Ok(new PagedJobsResponse
            {
                Items = items.Select(_mapper.Map<JobDto>).ToArray(),
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpPut("{id:guid}")]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<JobDto>> Update(Guid id, [FromBody] UpdateJobRequest request)
        {
            var job = await _repo.GetByIdAsync(id);
            if (job is null) return NotFound();

            job.Title = request.Title ?? job.Title;
            job.Description = request.Description ?? job.Description;
            job.Location = request.Location ?? job.Location;
            job.EmploymentType = request.EmploymentType ?? job.EmploymentType;
            job.SalaryMin = request.SalaryMin ?? job.SalaryMin;
            job.SalaryMax = request.SalaryMax ?? job.SalaryMax;
            job.UpdatedAtUtc = DateTime.UtcNow;

            _repo.Update(job);
            await _uow.SaveChangesAsync();

            return Ok(_mapper.Map<JobDto>(job));
        }

        [HttpDelete("{id:guid}")]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var job = await _repo.GetByIdAsync(id);
            if (job is null) return NotFound();

            _repo.Remove(job);
            await _uow.SaveChangesAsync();
            return NoContent();
        }
    }
}
