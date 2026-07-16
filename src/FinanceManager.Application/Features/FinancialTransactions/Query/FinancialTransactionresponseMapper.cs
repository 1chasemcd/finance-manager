using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialTransactions;

namespace FinanceManager.Application.Features.FinancialTransactions.Query;

internal sealed class FinancialTransactionResponseMapper : IExpressionMapper<FinancialTransaction, FinancialTransactionResponse>
{
    public Expression<Func<FinancialTransaction, FinancialTransactionResponse>> Map
        => (source) => new FinancialTransactionResponse()
        {
            Amount = source.Amount,
            Date = source.Date,
            Summary = source.Summary,
            FinancialAccountId = source.FinancialAccountId,
            FinancialAccountName = source.FinancialAccount.Name,
            SpendingCategoryId = source.SpendingCategoryId,
            SpendingCategoryName = source.SpendingCategory.Name
        };
}
