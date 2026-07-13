using System.Linq.Expressions;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal class SpendingCategoryResponseMapper : IExpressionMapper<SpendingCategory, SpendingCategoryResponse>
{
    public Expression<Func<SpendingCategory, SpendingCategoryResponse>> Map => (source) =>
        new SpendingCategoryResponse
        {
            // Id = source.Id,
            Name = source.Name,
            // Description = source.Description
        };
}
