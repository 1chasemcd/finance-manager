using FinanceManager.Api.Common;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Api.Endpoints;

internal static class TransactionSourceEndpoints
{
    public static void RegisterTransactionSourceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/sources");
        group.MapLookupEntity<TransactionSource>().WithName(RouteNames.LookupTransactionSource);
        group.MapSearchEntity<TransactionSource>().WithName(RouteNames.SearchTransactionSource);
        group.MapCreateEntity<TransactionSource>().WithName(RouteNames.CreateTransactionSource);
        group.MapUpdateEntity<TransactionSource>().WithName(RouteNames.UpdateTransactionSource);
        group.MapDeleteEntity<TransactionSource>().WithName(RouteNames.DeleteTransactionSource);
    }
}
