using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Application.Features.FinancialAccounts.Mappers;

internal sealed class CreateFinancialAccountRequestMapper : IMapper<CreateFinancialAccountRequest, FinancialAccount>
{
    public FinancialAccount Map(CreateFinancialAccountRequest source) =>
        FinancialAccount.CreateWithOwnerId(source.Name, source.OwnerId);
}
