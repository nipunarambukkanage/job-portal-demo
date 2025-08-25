using System.ComponentModel.DataAnnotations;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTO.Applications
{
    public class UpdateApplicationStatusRequest
    {
        [Required]
        public ApplicationStatus Status { get; set; }
    }
}
