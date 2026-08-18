using FinanceManager.Api.Common;
using FinanceManager.Domain.People;
using FinanceManager.Domain.TransactionCategories;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Api.Endpoints;

static class AutocompleteEndpoints
{
    public static void RegisterAutocompleteEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/autocomplete");
        group.MapAutocomplete<TransactionCategory>();
        group.MapAutocomplete<TransactionSource>();
        group.MapAutocomplete<Person>();

    }
}
