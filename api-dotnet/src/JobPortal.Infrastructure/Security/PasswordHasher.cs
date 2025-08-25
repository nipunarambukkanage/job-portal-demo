namespace JobPortal.Infrastructure.Security;

public class PasswordHasher
{
    public string Hash(string raw) => Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(raw));
    public bool Verify(string raw, string hash) => Hash(raw) == hash;
}
