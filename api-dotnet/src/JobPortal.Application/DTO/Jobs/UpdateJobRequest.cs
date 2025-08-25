using System.ComponentModel.DataAnnotations;

namespace JobPortal.Application.DTO.Jobs
{
    public class UpdateJobRequest
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(8000)]
        public string? Description { get; set; }

        [MaxLength(256)]
        public string? Location { get; set; }

        [MaxLength(64)]
        public string? EmploymentType { get; set; }

        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
    }
}
