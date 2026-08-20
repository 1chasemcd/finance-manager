using FinanceManager.Api.Common;
using FinanceManager.Domain.Transactions;

namespace FinanceManager.Api.Endpoints;

internal static class TransactionEndpoints
{
    public static void RegisterTransactionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/transactions");
        group.MapLookupEntity<Transaction>();
        group.MapSearchEntity<Transaction>();
    }
}
