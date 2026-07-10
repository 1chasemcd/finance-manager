using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.PersonalInfos;

public sealed class PersonalInfo : Entity
{
    public int? IdentityId { get; set; }
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    private PersonalInfo() { }
    public PersonalInfo(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
    }
}
