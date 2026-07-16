using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Application.Features.FinancialAccounts.Query;

internal sealed record FinancialAccountResponseMapper : IExpressionMapper<FinancialAccount, FinancialAccountResponse>
{
    public Expression<Func<FinancialAccount, FinancialAccountResponse>> Map
        => x => new FinancialAccountResponse
        {
            Name = x.Name,
            OwnerId = x.OwnerId,
            OwnerName = x.Owner.FirstName + " " + x.Owner.LastName
        };
}
