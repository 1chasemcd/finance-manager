using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.People;

public sealed class Person : Entity
{
    public int? IdentityId { get; private set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    private Person() { }
    public static Person Create(string firstName, string lastName)
    {
        return new()
        {
            FirstName = firstName,
            LastName = lastName
        };
    }
}
