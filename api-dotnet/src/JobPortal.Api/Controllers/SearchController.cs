using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Application.DTO.Jobs;
using JobPortal.Application.DTO.Orgs;
using JobPortal.Application.DTO.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // make public; flip to [Authorize] if you want to protect
    public class SearchController : ControllerBase
    {
        private readonly IJobRepository _jobs;
        private readonly IOrganizationRepository _orgs;
        private readonly IMapper _mapper;

        public SearchController(IJobRepository jobs, IOrganizationRepository orgs, IMapper mapper)
        {
            _jobs = jobs;
            _orgs = orgs;
            _mapper = mapper;
        }

        /// <summary>
        /// Combined search over Jobs and Organizations.
        /// </summary>
        /// <param name="q">Free text query applied to title/description (jobs) and name/description (orgs)</param>
        /// <param name="location">Filter by location (applied to both)</param>
        /// <param name="employmentType">Job filter (e.g., FullTime/PartTime/Contract)</param>
        /// <param name="jobsPage">Jobs page number (1-based)</param>
        /// <param name="jobsPageSize">Jobs page size (1..200)</param>
        /// <param name="orgsPage">Orgs page number (1-based)</param>
        /// <param name="orgsPageSize">Orgs page size (1..200)</param>
        [HttpGet]
        public async Task<ActionResult<CombinedSearchResponse>> Combined(
            [FromQuery] string? q,
            [FromQuery] string? location,
            [FromQuery] string? employmentType,
            [FromQuery] int jobsPage = 1,
            [FromQuery] int jobsPageSize = 10,
            [FromQuery] int orgsPage = 1,
            [FromQuery] int orgsPageSize = 10,
            CancellationToken ct = default)
        {
            if (jobsPage < 1) jobsPage = 1;
            if (orgsPage < 1) orgsPage = 1;
            if (jobsPageSize < 1 || jobsPageSize > 200) jobsPageSize = 10;
            if (orgsPageSize < 1 || orgsPageSize > 200) orgsPageSize = 10;

            var jobsReq = new JobSearchRequest
            {
                Query = q,
                Location = location,
                EmploymentType = employmentType,
                Page = jobsPage,
                PageSize = jobsPageSize
            };

            var orgsReq = new OrgSearchRequest
            {
                Query = q,
                Location = location,
                Page = orgsPage,
                PageSize = orgsPageSize
            };

            var jobsTask = _jobs.SearchAsync(jobsReq, ct);
            var orgsTask = _orgs.SearchAsync(orgsReq, ct);
            await Task.WhenAll(jobsTask, orgsTask);

            var (jobItems, jobTotal) = jobsTask.Result;
            var (orgItems, orgTotal) = orgsTask.Result;

            var resp = new CombinedSearchResponse
            {
                Query = q,
                Location = location,
                EmploymentType = employmentType,

                Jobs = jobItems.Select(_mapper.Map<JobDto>).ToArray(),
                JobsTotal = jobTotal,
                JobsPage = jobsPage,
                JobsPageSize = jobsPageSize,

                Orgs = orgItems.Select(_mapper.Map<OrgDto>).ToArray(),
                OrgsTotal = orgTotal,
                OrgsPage = orgsPage,
                OrgsPageSize = orgsPageSize
            };

            return Ok(resp);
        }

        /// <summary>Search jobs only (thin wrapper over repository).</summary>
        [HttpGet("jobs")]
        public async Task<ActionResult<PagedJobsResponse>> Jobs(
            [FromQuery] string? q,
            [FromQuery] string? location,
            [FromQuery] string? employmentType,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _jobs.SearchAsync(new JobSearchRequest
            {
                Query = q,
                Location = location,
                EmploymentType = employmentType,
                Page = page,
                PageSize = pageSize
            }, ct);

            return Ok(new PagedJobsResponse
            {
                Items = items.Select(_mapper.Map<JobDto>).ToArray(),
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>Search organizations only (thin wrapper over repository).</summary>
        [HttpGet("orgs")]
        public async Task<ActionResult<PagedOrgsResponse>> Orgs(
            [FromQuery] string? q,
            [FromQuery] string? location,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 20;

            var (items, total) = await _orgs.SearchAsync(new OrgSearchRequest
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
    }
}
