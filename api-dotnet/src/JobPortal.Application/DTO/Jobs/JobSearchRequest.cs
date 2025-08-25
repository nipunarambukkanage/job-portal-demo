using System;

namespace JobPortal.Application.DTO.Jobs
{
    public class JobSearchRequest
    {
        public string? Query { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? Location { get; set; }
        public string? EmploymentType { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
