using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Specifications.Applications;

public static class PendingByJobSpec
{
    public static Func<JobApplication, bool> IsPending(Guid jobId) =>
        a => a.JobId == jobId && a.Status == ApplicationStatus.Submitted;
}
