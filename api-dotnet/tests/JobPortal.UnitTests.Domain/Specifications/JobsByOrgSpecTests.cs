using Xunit;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Specifications.Jobs;
using System;

public class JobsByOrgSpecTests
{
    [Fact]
    public void IsForOrg_ReturnsTrue_WhenOrgMatches()
    {
        var org = Guid.NewGuid();
        var j = new Job(org, "t","d","l");
        Assert.True(JobsByOrgSpec.IsForOrg(org)(j));
    }
}
