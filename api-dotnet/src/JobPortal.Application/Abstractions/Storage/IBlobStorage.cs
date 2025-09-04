namespace JobPortal.Application.Abstractions.Storage;

public interface IBlobStorage
{
    Task<string> PutAsync(string container, string name, Stream content, string contentType, CancellationToken ct = default);

    Task<string> GetReadSasUrlAsync(string container, string name, TimeSpan lifetime, CancellationToken ct = default);
}
