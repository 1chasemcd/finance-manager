using FinanceManager.Api.Common;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Api.Endpoints;

static class SpendingCategoryEndpoints
{
    public static void RegisterSpendingCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/spendingcategories");
        group.MapLookupEntity<SpendingCategory>().WithName(RouteNames.GetSpendingCategory);
        group.MapCreateEntity<SpendingCategory>(createdAt: RouteNames.GetSpendingCategory);
        group.MapUpdateEntity<SpendingCategory>();
        group.MapDeleteEntity<SpendingCategory>();
        group.MapSearchEntity<SpendingCategory>();
    }
}
