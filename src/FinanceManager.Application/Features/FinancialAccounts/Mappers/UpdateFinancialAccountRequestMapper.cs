using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Application.Features.FinancialAccounts.Mappers;

internal sealed class UpdateFinancialAccountRequestMapper : IUpdateMapper<UpdateFinancialAccountRequest, FinancialAccount>
{
    public void Map(UpdateFinancialAccountRequest source, FinancialAccount destination)
    {
        destination.Name = source.Name;
        destination.OwnerId = source.OwnerId;
    }
}
