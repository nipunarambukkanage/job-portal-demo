using System.ComponentModel.DataAnnotations;

namespace JobPortal.Application.DTO.Orgs
{
    public class UpdateOrgRequest
    {
        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(8000)]
        public string? Description { get; set; }

        [MaxLength(2048), Url]
        public string? Website { get; set; }

        [MaxLength(2048), Url]
        public string? LogoUrl { get; set; }

        [MaxLength(256)]
        public string? Location { get; set; }
    }
}
