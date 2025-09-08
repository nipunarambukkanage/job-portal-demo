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
    //[Authorize]
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

        [HttpPost]
        //[Authorize(Policy = "MemberOnly")]
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

            var (items, _) = await _repo.ListWithJobAsync(entity.JobId, entity.CandidateId, 1, 1);
            var dto = items.Count > 0 ? items[0] : _mapper.Map<ApplicationDto>(entity);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        [HttpGet("{id:guid}")]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<ApplicationDto>> GetById(Guid id)
        {
            var (items, _) = await _repo.ListWithJobAsync(null, null, 1, 1);
            foreach (var item in items)
            {
                if (item.Id == id) return Ok(item);
            }

            var app = await _repo.GetByIdAsync(id);
            if (app is null) return NotFound();

            return Ok(_mapper.Map<ApplicationDto>(app));
        }

        [HttpGet]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedApplicationsResponse>> List(
            [FromQuery] Guid? jobId,
            [FromQuery] Guid? candidateId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _repo.ListWithJobAsync(jobId, candidateId, page, pageSize);

            return Ok(new PagedApplicationsResponse
            {
                Items = items.ToArray(),
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpPatch("{id:guid}/status")]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<ApplicationDto>> UpdateStatus(Guid id, [FromBody] UpdateApplicationStatusRequest request)
        {
            var app = await _repo.GetByIdAsync(id);
            if (app is null) return NotFound();

            app.Status = request.Status;
            app.UpdatedAtUtc = DateTime.UtcNow;

            _repo.Update(app);
            await _uow.SaveChangesAsync();

            var (items, _) = await _repo.ListWithJobAsync(app.JobId, app.CandidateId, 1, 1);
            var dto = items.Count > 0 ? items[0] : _mapper.Map<ApplicationDto>(app);

            return Ok(dto);
        }

        [HttpDelete("{id:guid}")]
        //[Authorize(Policy = "AdminOnly")]
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
