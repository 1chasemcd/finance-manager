using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories.Write;

internal sealed class WriteSpendingCategoryMapper : IMapper<WriteSpendingCategoryRequest, SpendingCategory>
{
    public SpendingCategory Map(WriteSpendingCategoryRequest source)
        => SpendingCategory.Create(source.Name, source.Description);
}
