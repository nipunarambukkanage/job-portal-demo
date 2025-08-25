using System;
using MediatR;

namespace JobPortal.Application.Features.Jobs.Commands.CreateJob
{
    public sealed record CreateJobCommand(
        Guid OrganizationId,
        string Title,
        string? Description,
        string? Location
    ) : IRequest<Guid>;
}
