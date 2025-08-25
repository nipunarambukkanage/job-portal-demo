namespace JobPortal.Application.DTO.Orgs
{
    public class OrgSearchRequest
    {
        public string? Query { get; set; }
        public string? Location { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
