using FinanceManager.Api.Common;
using FinanceManager.Domain.CategoryPatterns;

namespace FinanceManager.Api.Endpoints;

internal static class CategoryPatternEndpoints
{
    public static void RegisterCategoryPatternEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/patterns");
        group.MapLookupEntity<CategoryPattern>();
        group.MapSearchEntity<CategoryPattern>();
        group.MapCreateEntity<CategoryPattern>();
        group.MapUpdateEntity<CategoryPattern>();
        group.MapDeleteEntity<CategoryPattern>();
    }
}
