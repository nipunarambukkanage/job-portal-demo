using System;
using JobPortal.Domain.Enums;
using JobPortal.Application.DTO.Jobs;

namespace JobPortal.Application.DTO.Applications
{
    public class ApplicationDto
    {
        public Guid Id { get; set; }
        public Guid JobId { get; set; }
        public Guid CandidateId { get; set; }
        public string? CoverLetter { get; set; }
        public string? ResumeUrl { get; set; }
        public ApplicationStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
        public JobSummaryDto Job { get; set; } = new JobSummaryDto();
    }

    public class PagedApplicationsResponse
    {
        public ApplicationDto[] Items { get; set; } = Array.Empty<ApplicationDto>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
