namespace JobPortal.Application.Settings;

public sealed class JwtSettings
{
    public string Issuer { get; set; } = "jobportal";
    public string Audience { get; set; } = "jobportal";
    public string Key { get; set; } = "dev-secret-change";
    public int ExpMinutes { get; set; } = 60;
}
