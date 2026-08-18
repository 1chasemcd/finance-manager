using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Application.Features.TransactionCategories.Query;

internal sealed class TransactionCategoryResponseMapper : IExpressionMapper<TransactionCategory, TransactionCategoryResponse>
{
    public Expression<Func<TransactionCategory, TransactionCategoryResponse>> Map => (source) =>
        new TransactionCategoryResponse
        {
            Id = source.Id,
            Name = source.Name,
            Description = source.Description
        };
}
