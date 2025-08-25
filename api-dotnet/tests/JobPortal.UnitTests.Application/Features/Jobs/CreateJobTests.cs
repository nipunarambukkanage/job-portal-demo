using Xunit;
using JobPortal.Application.Features.Jobs.Commands.CreateJob;

public class CreateJobTests
{
    [Fact]
    public void Validator_Blocks_Empty_Title()
    {
        var v = new CreateJobCommandValidator();
        var result = v.Validate(new CreateJobCommand(Guid.NewGuid(), "", "d", "l"));
        Assert.False(result.IsValid);
    }
}
