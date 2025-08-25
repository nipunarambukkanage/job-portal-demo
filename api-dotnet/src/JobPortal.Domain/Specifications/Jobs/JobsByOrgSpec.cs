using JobPortal.Domain.Entities;

namespace JobPortal.Domain.Specifications.Jobs;

public static class JobsByOrgSpec
{
    public static Func<Job, bool> IsForOrg(Guid orgId) => j => j.OrganizationId == orgId;
}
