using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using JobPortal.Application.DTO.Applications;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // FallbackPolicy already requires auth; keeping explicit for clarity
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationRepository _repo;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public ApplicationsController(IApplicationRepository repo, IUnitOfWork uow, IMapper mapper)
        {
            _repo = repo;
            _uow = uow;
            _mapper = mapper;
        }

        /// <summary>Create a new application for a job.</summary>
        [HttpPost]
        public async Task<ActionResult<ApplicationDto>> Create([FromBody] CreateApplicationRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = new JobApplication
            {
                Id = Guid.NewGuid(),
                JobId = request.JobId,
                CandidateId = request.CandidateId,
                CoverLetter = request.CoverLetter,
                ResumeUrl = request.ResumeUrl,
                Status = ApplicationStatus.Submitted,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            await _repo.AddAsync(entity);
            await _uow.SaveChangesAsync();

            var dto = _mapper.Map<ApplicationDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        /// <summary>Get an application by id.</summary>
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApplicationDto>> GetById(Guid id)
        {
            var app = await _repo.GetByIdAsync(id);
            if (app is null) return NotFound();

            return Ok(_mapper.Map<ApplicationDto>(app));
        }

        /// <summary>List applications for a job with simple paging.</summary>
        [HttpGet]
        public async Task<ActionResult<PagedApplicationsResponse>> List(
            [FromQuery] Guid jobId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _repo.ListByJobAsync(jobId, page, pageSize);
            return Ok(new PagedApplicationsResponse
            {
                Items = _mapper.Map<ApplicationDto[]>(items),
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>Update application status (e.g., Submitted -> Reviewed -> Interview -> Offered -> Rejected).</summary>
        [HttpPatch("{id:guid}/status")]
        public async Task<ActionResult<ApplicationDto>> UpdateStatus(Guid id, [FromBody] UpdateApplicationStatusRequest request)
        {
            var app = await _repo.GetByIdAsync(id);
            if (app is null) return NotFound();

            app.Status = request.Status;
            app.UpdatedAtUtc = DateTime.UtcNow;

            _repo.Update(app);
            await _uow.SaveChangesAsync();

            return Ok(_mapper.Map<ApplicationDto>(app));
        }

        /// <summary>Delete an application.</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var app = await _repo.GetByIdAsync(id);
            if (app is null) return NotFound();

            _repo.Remove(app);
            await _uow.SaveChangesAsync();

            return NoContent();
        }
    }
}
