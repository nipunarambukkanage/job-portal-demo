using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortal.Application.DTO.Applications
{
    public class CreateApplicationRequest
    {
        [Required]
        public Guid JobId { get; set; }

        [Required]
        public Guid CandidateId { get; set; }

        [MaxLength(4000)]
        public string? CoverLetter { get; set; }

        [Url]
        [MaxLength(2048)]
        public string? ResumeUrl { get; set; }
    }
}
