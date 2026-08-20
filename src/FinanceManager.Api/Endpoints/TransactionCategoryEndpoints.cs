using FinanceManager.Api.Common;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Api.Endpoints;

static class TransactionCategoryEndpoints
{
    public static void RegisterTransactionCategoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/transactioncategories");
        group.MapLookupEntity<TransactionCategory>();
        group.MapCreateEntity<TransactionCategory>();
        group.MapUpdateEntity<TransactionCategory>();
        group.MapDeleteEntity<TransactionCategory>();
        group.MapSearchEntity<TransactionCategory>();
    }
}
