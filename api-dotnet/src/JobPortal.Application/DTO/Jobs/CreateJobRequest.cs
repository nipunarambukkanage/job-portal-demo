using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortal.Application.DTO.Jobs
{
    public class CreateJobRequest
    {
        [Required]
        public Guid OrganizationId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = default!;

        [MaxLength(8000)]
        public string? Description { get; set; }

        [MaxLength(256)]
        public string? Location { get; set; }

        // normalized string values: "FullTime", "PartTime", "Contract", etc.
        [MaxLength(64)]
        public string? EmploymentType { get; set; }

        [Range(0, 100000000)]
        public decimal? SalaryMin { get; set; }

        [Range(0, 100000000)]
        public decimal? SalaryMax { get; set; }
    }
}
