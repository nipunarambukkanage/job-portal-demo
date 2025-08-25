using FluentValidation;
using JobPortal.Application.DTO.Orgs;

namespace JobPortal.Application.Features.Orgs;

public class UpdateOrgValidator : AbstractValidator<UpdateOrgRequest>
{
    public UpdateOrgValidator()
    {
        RuleFor(x => x.Name).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(8000);
        RuleFor(x => x.Website).MaximumLength(2048).When(x => !string.IsNullOrWhiteSpace(x.Website));
        RuleFor(x => x.LogoUrl).MaximumLength(2048).When(x => !string.IsNullOrWhiteSpace(x.LogoUrl));
        RuleFor(x => x.Location).MaximumLength(256);
    }
}
