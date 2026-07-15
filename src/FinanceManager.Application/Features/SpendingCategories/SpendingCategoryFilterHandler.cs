using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed record SpendingCategoryFilterHandler : IEntityFilterHandler<SpendingCategory, SpendingCategoryFilter>
{
    public IQueryable<SpendingCategory> ApplyFilter(
        SpendingCategoryFilter filter,
        IQueryable<SpendingCategory> query)
    {
        if (filter.NameContains is { } contains)
            return query.Where(x => x.Name.Contains(contains));

        return query;
    }
}
