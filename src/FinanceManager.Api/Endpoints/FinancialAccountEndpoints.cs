using FinanceManager.Api.Common;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Api.Endpoints;

internal static class FinancialAccountEndpoints
{
    public static void RegisterFinancialAccountEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/financialaccounts");
        group.MapLookupEntity<FinancialAccount>();
        group.MapSearchEntity<FinancialAccount>();
        group.MapCreateEntity<FinancialAccount>();
        group.MapUpdateEntity<FinancialAccount>();
        group.MapDeleteEntity<FinancialAccount>();
    }
}
