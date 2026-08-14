using FinanceManager.Api.Common;
using FinanceManager.Domain.FinancialAccounts;

namespace FinanceManager.Api.Endpoints;

internal static class FinancialAccountEndpoints
{
    public static void RegisterFinancialAccountEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/financialaccounts");
        group.MapLookupEntity<FinancialAccount>().WithName(RouteNames.LookupAccount);
        group.MapSearchEntity<FinancialAccount>().WithName(RouteNames.SearchAccount);
        group.MapCreateEntity<FinancialAccount>().WithName(RouteNames.CreateAccount);
        group.MapUpdateEntity<FinancialAccount>().WithName(RouteNames.UpdateAccount);
        group.MapDeleteEntity<FinancialAccount>().WithName(RouteNames.DeleteAccount);
    }
}
