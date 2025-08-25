namespace JobPortal.Infrastructure.Security;

public class JwtTokenService
{
    public string IssueToken(Guid userId, string email) => "dev-token";
}
