using FinanceManager.Api.Common;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Api.Endpoints;

static class TransactionCategoryEndpoints
{
    public static void RegisterTransactionCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/transactioncategories");
        group.MapLookupEntity<TransactionCategory>().WithName(RouteNames.LookupTransactionCategory);
        group.MapCreateEntity<TransactionCategory>(createdAt: RouteNames.LookupTransactionCategory).WithName(RouteNames.CreateTransactionCategory);
        group.MapUpdateEntity<TransactionCategory>().WithName(RouteNames.UpdateTransactionCategory);
        group.MapDeleteEntity<TransactionCategory>().WithName(RouteNames.DeleteTransactionCategory);
        group.MapSearchEntity<TransactionCategory>().WithName(RouteNames.SearchTransactionCategory);
    }
}
