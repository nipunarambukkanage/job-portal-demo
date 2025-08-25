using FluentValidation;

namespace JobPortal.Application.Features.Jobs.Commands.CreateJob;

public sealed class CreateJobCommandValidator : AbstractValidator<CreateJobCommand>
{
    public CreateJobCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(140);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Location).NotEmpty().MaximumLength(100);
    }
}
