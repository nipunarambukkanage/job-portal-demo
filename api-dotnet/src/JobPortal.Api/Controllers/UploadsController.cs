using System.Text.RegularExpressions;
using JobPortal.Application.Abstractions.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IBlobStorage _blob;

    public UploadsController(IBlobStorage blob) => _blob = blob;

    // [Authorize] // enable when Clerk is fully wired in Swagger flow
    [HttpPost("resume")]
    [RequestSizeLimit(20_000_000)] // 20MB
    public async Task<IActionResult> UploadResume([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("File is required");

        // choose a good blob name: /resumes/{yyyy}/{MM}/{guid}_{sanitized-name}
        var safe = Regex.Replace(file.FileName, @"[^\w\.\-]+", "_");
        var name = $"{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid()}_{safe}";
        const string container = "resumes";

        await using var s = file.OpenReadStream();
        var blobUrl = await _blob.PutAsync(container, name, s, file.ContentType, ct);

        // short SAS (10 min) for Doc Intel fetch
        var sasUrl = await _blob.GetReadSasUrlAsync(container, name, TimeSpan.FromMinutes(10), ct);

        return Ok(new { blobUrl, sasUrl });
    }
}
