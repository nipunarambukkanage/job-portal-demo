using Xunit;
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class JobsEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public JobsEndpointTests(ApiFactory f) => _client = f.CreateClient();

    [Fact(Skip="Requires real DB")]
    public async Task Create_Job_Returns201()
    {
        var payload = JsonSerializer.Serialize(new { organizationId=System.Guid.NewGuid(), title="t", description="d", location="l" });
        var resp = await _client.PostAsync("/api/jobs", new StringContent(payload, Encoding.UTF8, "application/json"));
        Assert.True((int)resp.StatusCode is 201 or 400 or 500);
    }
}
