using FinanceManager.Api.Common;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Api.Endpoints;

internal static class TransactionSourceEndpoints
{
    public static void RegisterTransactionSourceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/sources");
        group.MapLookupEntity<TransactionSource>();
        group.MapSearchEntity<TransactionSource>();
        group.MapCreateEntity<TransactionSource>();
        group.MapUpdateEntity<TransactionSource>();
        group.MapDeleteEntity<TransactionSource>();
    }
}
