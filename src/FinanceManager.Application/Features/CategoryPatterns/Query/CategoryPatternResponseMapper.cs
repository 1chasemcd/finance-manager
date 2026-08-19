using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.CategoryPatterns;

namespace FinanceManager.Application.Features.CategoryPatterns.Query;

internal sealed class CategoryPatternResponseMapper : IExpressionMapper<CategoryPattern, CategoryPatternResponse>
{
    public Expression<Func<CategoryPattern, CategoryPatternResponse>> Map => (source) =>
        new CategoryPatternResponse
        {
            Id = source.Id,
            Pattern = source.Pattern,
            TransactionCategoryId = source.TransactionCategoryId,
            TransactionCategoryName = source.TransactionCategory == null ? null : source.TransactionCategory.Name
        };
}
