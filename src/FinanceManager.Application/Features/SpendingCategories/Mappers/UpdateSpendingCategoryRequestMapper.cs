using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories.Mappers;

internal sealed class UpdateSpendingCategoryRequestMapper : IUpdateMapper<UpdateSpendingCategoryRequest, SpendingCategory>
{
    public void Map(UpdateSpendingCategoryRequest source, SpendingCategory destination)
    {
        destination.UpdateName(source.Name);
        destination.Description = source.Description;
    }
}
