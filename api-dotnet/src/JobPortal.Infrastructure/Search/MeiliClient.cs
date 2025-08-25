namespace JobPortal.Infrastructure.Search;

public class MeiliClient
{
    private readonly HttpClient _http = new();
    public Task IndexJobAsync(object job, CancellationToken ct = default) => Task.CompletedTask;
}
