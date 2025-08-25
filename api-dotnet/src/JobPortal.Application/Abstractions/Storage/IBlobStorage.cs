namespace JobPortal.Application.Abstractions.Storage;

public interface IBlobStorage
{
    Task<string> PutAsync(string container, string name, Stream content, string contentType, CancellationToken ct = default);
}
