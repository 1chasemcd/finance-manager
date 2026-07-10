using FinanceManager.Application.Common.Mapping;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal class SpendingCategoryResponseMapper : IMapper<SpendingCategory, SpendingCategoryResponse>
{
    public SpendingCategoryResponse Map(SpendingCategory source)
    {
        return new SpendingCategoryResponse
        {
            Id = source.Id,
            Name = source.Name,
            Description = source.Description
        };
    }
}
