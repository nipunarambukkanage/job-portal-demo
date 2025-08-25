using JobPortal.Application.DTO.Jobs;
using JobPortal.Application.DTO.Orgs;

namespace JobPortal.Application.DTO.Search
{
    public class CombinedSearchResponse
    {
        // Echoed filters (handy for the client)
        public string? Query { get; set; }
        public string? Location { get; set; }
        public string? EmploymentType { get; set; }

        // Jobs slice
        public JobDto[] Jobs { get; set; } = [];
        public int JobsTotal { get; set; }
        public int JobsPage { get; set; }
        public int JobsPageSize { get; set; }

        // Orgs slice
        public OrgDto[] Orgs { get; set; } = [];
        public int OrgsTotal { get; set; }
        public int OrgsPage { get; set; }
        public int OrgsPageSize { get; set; }
    }
}
