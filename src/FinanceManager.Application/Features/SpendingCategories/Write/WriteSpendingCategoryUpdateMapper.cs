using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories.Write;

internal sealed class UpdateSpendingCategoryRequestMapper : IUpdateMapper<WriteSpendingCategoryRequest, SpendingCategory>
{
    public void Map(WriteSpendingCategoryRequest source, SpendingCategory destination)
    {
        destination.Name = source.Name;
        destination.Description = source.Description;
    }
}
