using System;
using MediatR;
using JobPortal.Application.DTO.Jobs;

namespace JobPortal.Application.Features.Jobs.Queries.GetJobById
{
    public sealed record GetJobByIdQuery(Guid Id) : IRequest<JobDto?>;
}
