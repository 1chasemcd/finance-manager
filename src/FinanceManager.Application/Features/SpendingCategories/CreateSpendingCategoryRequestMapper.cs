using FinanceManager.Application.Common.Mapping;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal class CreateSpendingCategoryRequestMapper : IMapper<CreateSpendingCategoryRequest, SpendingCategory>
{
    public SpendingCategory Map(CreateSpendingCategoryRequest source)
        => SpendingCategory.Create(source.Name, source.Description);
}
