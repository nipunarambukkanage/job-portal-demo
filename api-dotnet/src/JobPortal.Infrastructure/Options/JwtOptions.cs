namespace JobPortal.Infrastructure.Options;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "jobportal";
    public string Audience { get; set; } = "jobportal";
    public string Key { get; set; } = "dev-secret-change";
}
