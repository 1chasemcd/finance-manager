using FinanceManager.Domain.Common;
using FinanceManager.Domain.PersonalInfos;

namespace FinanceManager.Domain.FinancialAccounts;

public sealed class FinancialAccount : Entity
{
    public string Name { get; private set; } = null!;
    public int OwnerInfoId { get; private set; }
    public PersonalInfo OwnerInfo { get; private set; } = null!;

    private FinancialAccount() { }
    public FinancialAccount(string name, PersonalInfo ownerInfo)
    {
        Name = name;
        OwnerInfo = ownerInfo;
        OwnerInfoId = ownerInfo.Id;
    }
}
