using System;

namespace JobPortal.Domain.Entities
{
    public class Job
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }

        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? EmploymentType { get; set; }

        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }

        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }

        public Job() { }

        public Job(Guid organizationId, string title, string? description, string? location)
        {
            Id = Guid.NewGuid();
            OrganizationId = organizationId;
            Title = title;
            Description = description;
            Location = location;
            CreatedAtUtc = DateTime.UtcNow;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
