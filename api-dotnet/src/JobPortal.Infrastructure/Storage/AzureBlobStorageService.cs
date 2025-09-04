using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using JobPortal.Application.Abstractions.Storage;

namespace JobPortal.Infrastructure.Storage;

public class AzureBlobStorageService : IBlobStorage
{
    private readonly BlobServiceClient _svc;
    public AzureBlobStorageService(BlobServiceClient svc) => _svc = svc;

    public async Task<string> PutAsync(string container, string name, Stream content, string contentType, CancellationToken ct = default)
    {
        var c = _svc.GetBlobContainerClient(container);
        await c.CreateIfNotExistsAsync(cancellationToken: ct);
        var blob = c.GetBlobClient(name);
        await blob.UploadAsync(content, overwrite: true, cancellationToken: ct);

        if (!string.IsNullOrWhiteSpace(contentType))
        {
            await blob.SetHttpHeadersAsync(
                new Azure.Storage.Blobs.Models.BlobHttpHeaders { ContentType = contentType },
                cancellationToken: ct
            );
        }

        return blob.Uri.ToString();
    }

    public Task<string> GetReadSasUrlAsync(string container, string name, TimeSpan lifetime, CancellationToken ct = default)
    {
        var containerClient = _svc.GetBlobContainerClient(container);
        var blob = containerClient.GetBlobClient(name);

        // IMPORTANT: CanGenerateSasUri requires the client to be created with Shared Key credentials.
        // e.g., new BlobServiceClient("<connection string with account key>")
        if (!blob.CanGenerateSasUri)
        {
            throw new InvalidOperationException(
                "This BlobClient cannot generate SAS. Ensure BlobServiceClient was created with Shared Key credentials (connection string with account key)."
            );
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = container,
            BlobName = name,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-2),
            ExpiresOn = DateTimeOffset.UtcNow.Add(lifetime),
            Protocol = SasProtocol.Https
        };

        // Read-only SAS for Doc Intelligence to fetch the blob
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blob.GenerateSasUri(sasBuilder);
        return Task.FromResult(sasUri.ToString());
    }
}
