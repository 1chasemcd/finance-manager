using FinanceManager.Api.Common;
using FinanceManager.Domain.CategoryPatterns;

namespace FinanceManager.Api.Endpoints;

internal static class CategoryPatternEndpoints
{
    public static void RegisterCategoryPatternEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/patterns");
        group.MapLookupEntity<CategoryPattern>().WithName(RouteNames.LookupCategoryPattern);
        group.MapSearchEntity<CategoryPattern>().WithName(RouteNames.SearchCategoryPattern);
        group.MapCreateEntity<CategoryPattern>().WithName(RouteNames.CreateCategoryPattern);
        group.MapUpdateEntity<CategoryPattern>().WithName(RouteNames.UpdateCategoryPattern);
        group.MapDeleteEntity<CategoryPattern>().WithName(RouteNames.DeleteCategoryPattern);
    }
}
