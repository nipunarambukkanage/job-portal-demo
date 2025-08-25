using Xunit;
using JobPortal.Domain.Entities;
using System;

public class JobTests
{
    [Fact]
    public void CreateJob_Succeeds()
    {
        var j = new Job(Guid.NewGuid(), "Title", "Desc", "Remote");
        Assert.Equal("Title", j.Title);
    }
}
