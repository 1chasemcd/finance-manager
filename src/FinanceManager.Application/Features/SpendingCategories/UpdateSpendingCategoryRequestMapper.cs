using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed class UpdateSpendingCategoryRequestMapper : IUpdateMapper<UpdateSpendingCategoryRequest, SpendingCategory>
{
    public void Map(UpdateSpendingCategoryRequest source, SpendingCategory destination)
    {
        destination.UpdateDescription(source.Description);
    }
}
