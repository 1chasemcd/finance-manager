using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed record ListSpendingCategoriesFilterHandler : IEntityListFilterHandler<ListSpendingCategoryRequest, SpendingCategory>
{
    public IQueryable<SpendingCategory> ApplyFilter(
        ListSpendingCategoryRequest filter,
        IQueryable<SpendingCategory> query)
    {
        if (filter.NameContains is { } contains)
            return query.Where(x => x.Name.Contains(contains));

        return query;
    }
}
