using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Application.Features.FinancialAccounts.Write;

internal sealed class CreateFinancialAccountMapper : IMapper<WriteFinancialAccountRequest, FinancialAccount>
{
    public FinancialAccount Map(WriteFinancialAccountRequest source) =>
        FinancialAccount.CreateWithOwnerId(source.Name, source.OwnerId);
}
