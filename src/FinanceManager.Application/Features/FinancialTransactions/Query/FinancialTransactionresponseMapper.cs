using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialTransactions;

namespace FinanceManager.Application.Features.FinancialTransactions.Query;

internal sealed class FinancialTransactionResponseMapper : IExpressionMapper<FinancialTransaction, FinancialTransactionResponse>
{
    public Expression<Func<FinancialTransaction, FinancialTransactionResponse>> Map
        => (source) => new FinancialTransactionResponse()
        {
            Id = source.Id,
            Amount = source.Amount,
            Date = source.Date,
            Summary = source.Summary,
            TransactionSourceId = source.TransactionSourceId,
            TransactionSourceName = source.TransactionSource.Name,
            TransactionCategoryId = source.TransactionCategoryId,
            TransactionCategoryName = source.TransactionCategory.Name
        };
}
