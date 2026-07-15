using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.PersonalInfos;

public sealed class PersonalInfo : Entity
{
    public int? IdentityId { get; private set; }
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    private PersonalInfo() { }
    public static PersonalInfo Create(string firstName, string lastName)
    {
        return new()
        {
            FirstName = firstName,
            LastName = lastName
        };
    }
}
