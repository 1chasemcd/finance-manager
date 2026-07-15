using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed class CreateSpendingCategoryRequestMapper : IMapper<CreateSpendingCategoryRequest, SpendingCategory>
{
    public SpendingCategory Map(CreateSpendingCategoryRequest source)
        => SpendingCategory.Create(source.Name, source.Description);
}
