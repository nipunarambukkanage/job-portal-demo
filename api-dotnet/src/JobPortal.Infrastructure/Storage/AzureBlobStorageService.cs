using Azure.Storage.Blobs;
using JobPortal.Application.Abstractions.Storage;

namespace JobPortal.Infrastructure.Storage;

public class AzureBlobStorageService : IBlobStorage
{
    private readonly BlobServiceClient _svc;
    public AzureBlobStorageService(BlobServiceClient svc) => _svc = svc;

    public async Task<string> PutAsync(string container, string name, Stream content, string contentType, CancellationToken ct = default)
    {
        var c = _svc.GetBlobContainerClient(container);
        await c.CreateIfNotExistsAsync();
        var blob = c.GetBlobClient(name);
        await blob.UploadAsync(content, overwrite:true, cancellationToken: ct);
        return blob.Uri.ToString();
    }
}
