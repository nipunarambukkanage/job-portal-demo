using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public sealed class CandidateProfile : AuditableEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public string Headline { get; private set; } = string.Empty;
    public string SkillsCsv { get; private set; } = string.Empty;

    private CandidateProfile() { }
    public CandidateProfile(Guid userId, string headline, string skillsCsv)
    {
        UserId = userId; Headline = headline; SkillsCsv = skillsCsv;
    }
}
