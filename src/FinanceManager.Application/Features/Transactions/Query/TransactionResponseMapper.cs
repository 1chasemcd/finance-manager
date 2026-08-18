using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.Transactions;

namespace FinanceManager.Application.Features.Transactions.Query;

internal sealed class TransactionResponseMapper : IExpressionMapper<Transaction, TransactionResponse>
{
    public Expression<Func<Transaction, TransactionResponse>> Map
        => (source) => new TransactionResponse()
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
