using FinanceManager.Api.Common;
using FinanceManager.Domain.FinancialTransactions;

namespace FinanceManager.Api.Endpoints;

internal static class FinancialTransactionEndpoints
{
    public static void RegisterFinancialTransactionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/financialtransactions");
        group.MapLookupEntity<FinancialTransaction>();
        group.MapSearchEntity<FinancialTransaction>();
    }
}
