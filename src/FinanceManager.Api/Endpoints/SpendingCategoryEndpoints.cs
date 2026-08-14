using FinanceManager.Api.Common;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Api.Endpoints;

static class SpendingCategoryEndpoints
{
    public static void RegisterSpendingCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/spendingcategories");
        group.MapLookupEntity<SpendingCategory>().WithName(RouteNames.LookupSpendingCategory);
        group.MapCreateEntity<SpendingCategory>(createdAt: RouteNames.LookupSpendingCategory).WithName(RouteNames.CreateSpendingCategory);
        group.MapUpdateEntity<SpendingCategory>().WithName(RouteNames.UpdateSpendingCategory);
        group.MapDeleteEntity<SpendingCategory>().WithName(RouteNames.DeleteSpendingCategory);
        group.MapSearchEntity<SpendingCategory>().WithName(RouteNames.SearchSpendingCategory);
    }
}
