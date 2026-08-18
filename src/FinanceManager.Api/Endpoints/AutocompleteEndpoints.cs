using FinanceManager.Api.Common;
using FinanceManager.Domain.SpendingCategories;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Api.Endpoints;

static class AutocompleteEndpoints
{
    public static void RegisterAutocompleteEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/autocomplete");
        group.MapAutocomplete<SpendingCategory>();
        group.MapAutocomplete<TransactionSource>();
    }
}
