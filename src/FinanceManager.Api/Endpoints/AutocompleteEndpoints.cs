using FinanceManager.Api.Common;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Api.Endpoints;

static class AutocompleteEndpoints
{
    public static void RegisterAutocompleteEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/autocomplete");
        group.MapAutocomplete<SpendingCategory>();
        group.MapAutocomplete<FinancialAccount>();
    }
}
