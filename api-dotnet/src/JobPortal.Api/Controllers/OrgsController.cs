using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Orgs;
using JobPortal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // make public endpoints [AllowAnonymous] as needed
    public class OrgsController : ControllerBase
    {
        private readonly IOrganizationRepository _repo;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public OrgsController(IOrganizationRepository repo, IUnitOfWork uow, IMapper mapper)
        {
            _repo = repo;
            _uow = uow;
            _mapper = mapper;
        }

        /// <summary>Create a new organization.</summary>
        [HttpPost]
        public async Task<ActionResult<OrgDto>> Create([FromBody] CreateOrgRequest request, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = _mapper.Map<Organization>(request);
            entity.Id = Guid.NewGuid();
            entity.CreatedAtUtc = DateTime.UtcNow;
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _repo.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            var dto = _mapper.Map<OrgDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        /// <summary>Get an organization by id.</summary>
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<OrgDto>> GetById(Guid id, CancellationToken ct)
        {
            var org = await _repo.GetByIdAsync(id, ct);
            if (org is null) return NotFound();
            return Ok(_mapper.Map<OrgDto>(org));
        }

        /// <summary>Search organizations with paging.</summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PagedOrgsResponse>> Search(
            [FromQuery] string? q,
            [FromQuery] string? location,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _repo.SearchAsync(new OrgSearchRequest
            {
                Query = q,
                Location = location,
                Page = page,
                PageSize = pageSize
            }, ct);

            return Ok(new PagedOrgsResponse
            {
                Items = items.Select(_mapper.Map<OrgDto>).ToArray(),
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>Update an organization.</summary>
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<OrgDto>> Update(Guid id, [FromBody] UpdateOrgRequest request, CancellationToken ct)
        {
            var org = await _repo.GetByIdAsync(id, ct);
            if (org is null) return NotFound();

            org.Name = request.Name ?? org.Name;
            org.Description = request.Description ?? org.Description;
            org.Website = request.Website ?? org.Website;
            org.LogoUrl = request.LogoUrl ?? org.LogoUrl;
            org.Location = request.Location ?? org.Location;
            org.UpdatedAtUtc = DateTime.UtcNow;

            _repo.Update(org);
            await _uow.SaveChangesAsync(ct);

            return Ok(_mapper.Map<OrgDto>(org));
        }

        /// <summary>Delete an organization.</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            var org = await _repo.GetByIdAsync(id, ct);
            if (org is null) return NotFound();

            _repo.Remove(org);
            await _uow.SaveChangesAsync(ct);
            return NoContent();
        }
    }
}
