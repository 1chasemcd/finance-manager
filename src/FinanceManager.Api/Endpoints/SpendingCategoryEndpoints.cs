using FinanceManager.Api.Common;
using FinanceManager.Application.Features.SpendingCategories;

namespace FinanceManager.Api.Endpoints;

static class SpendingCategoryEndpoints
{
    public static void RegisterSpendingCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/spendingcategories");
        group.MapEntityGet<SpendingCategoryResponse>()
            .WithName(RouteNames.GetSpendingCategory);
        group.MapEntityCreate<CreateSpendingCategoryRequest>(getRouteName: RouteNames.GetSpendingCategory);
        group.MapEntityUpdate<UpdateSpendingCategoryRequest>();
        group.MapEntityDelete<DeleteSpendingCategoryRequest>();
        group.MapEntityList<ListSpendingCategoryRequest, SpendingCategoryResponse>();
    }
}
