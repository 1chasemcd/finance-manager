using FinanceManager.Domain.Common;
using FinanceManager.Domain.PersonalInfos;

namespace FinanceManager.Domain.TransactionSources;

public sealed class TransactionSource : Entity
{
    public string Name { get; set; } = null!;
    public int OwnerId { get; set; }
    public PersonalInfo Owner { get; set; } = null!;

    private TransactionSource() { }
    public static TransactionSource CreateWithOwner(string name, PersonalInfo owner)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return new()
        {
            Name = name,
            Owner = owner,
            OwnerId = owner.Id
        };
    }

    public static TransactionSource CreateWithOwnerId(string name, int ownerId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return new()
        {
            Name = name,
            OwnerId = ownerId
        };
    }
}
