using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Application.Features.FinancialAccounts.Write;

internal sealed class CreateFinancialAccountUpdateMapper : IUpdateMapper<WriteFinancialAccountRequest, FinancialAccount>
{
    public void Map(WriteFinancialAccountRequest source, FinancialAccount destination)
    {
        destination.Name = source.Name;
        destination.OwnerId = source.OwnerId;
    }
}
