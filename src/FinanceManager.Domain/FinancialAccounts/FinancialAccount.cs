using FinanceManager.Domain.Common;
using FinanceManager.Domain.PersonalInfos;

namespace FinanceManager.Domain.FinancialAccounts;

public sealed class FinancialAccount : Entity
{
    public string Name { get; set; } = null!;
    public int OwnerId { get; set; }
    public PersonalInfo Owner { get; set; } = null!;

    private FinancialAccount() { }
    public static FinancialAccount CreateWithOwner(string name, PersonalInfo owner)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return new()
        {
            Name = name,
            Owner = owner,
            OwnerId = owner.Id
        };
    }

    public static FinancialAccount CreateWithOwnerId(string name, int ownerId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return new()
        {
            Name = name,
            OwnerId = ownerId
        };
    }
}
