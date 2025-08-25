using System;

namespace JobPortal.Application.DTO.Jobs
{
    public class JobDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? EmploymentType { get; set; } // e.g., FullTime/PartTime/Contract
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }

    public class PagedJobsResponse
    {
        public JobDto[] Items { get; set; } = Array.Empty<JobDto>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
