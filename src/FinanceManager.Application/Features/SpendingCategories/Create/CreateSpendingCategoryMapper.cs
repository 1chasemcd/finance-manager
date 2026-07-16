using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories.Create;

internal sealed class CreateSpendingCategoryMapper : IMapper<CreateSpendingCategoryRequest, SpendingCategory>
{
    public SpendingCategory Map(CreateSpendingCategoryRequest source)
        => SpendingCategory.Create(source.Name, source.Description);
}
