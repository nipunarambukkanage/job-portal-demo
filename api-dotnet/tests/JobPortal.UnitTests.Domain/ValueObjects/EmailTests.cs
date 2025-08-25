using Xunit;
using JobPortal.Domain.ValueObjects;

public class EmailTests
{
    [Fact]
    public void Email_Value_Roundtrips() => Assert.Equal("a@b.com", new Email("a@b.com").Value);
}
