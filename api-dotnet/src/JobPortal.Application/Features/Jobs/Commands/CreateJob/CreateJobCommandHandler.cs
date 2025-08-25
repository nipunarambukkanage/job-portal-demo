using System;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.Abstractions.Persistence;
using JobPortal.Application.Abstractions.Persistence.Repositories;
using JobPortal.Domain.Entities;
using MediatR;

namespace JobPortal.Application.Features.Jobs.Commands.CreateJob
{
    public sealed class CreateJobCommandHandler : IRequestHandler<CreateJobCommand, Guid>
    {
        private readonly IJobRepository _repo;
        private readonly IUnitOfWork _uow;

        public CreateJobCommandHandler(IJobRepository repo, IUnitOfWork uow)
        {
            _repo = repo;
            _uow = uow;
        }

        public async Task<Guid> Handle(CreateJobCommand request, CancellationToken ct)
        {
            var job = new Job(request.OrganizationId, request.Title, request.Description, request.Location);
            await _repo.AddAsync(job, ct);
            await _uow.SaveChangesAsync(ct);
            return job.Id;
        }
    }
}
