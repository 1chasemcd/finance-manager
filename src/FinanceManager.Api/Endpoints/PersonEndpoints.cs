using FinanceManager.Api.Common;
using FinanceManager.Domain.People;

namespace FinanceManager.Api.Endpoints;

internal static class PersonEndpoints
{
    public static void RegisterPersonEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/people");
        group.MapLookupEntity<Person>().WithName(RouteNames.LookupPerson);
        group.MapSearchEntity<Person>().WithName(RouteNames.SearchPerson);
        group.MapCreateEntity<Person>().WithName(RouteNames.CreatePerson);
        group.MapUpdateEntity<Person>().WithName(RouteNames.UpdatePerson);
        group.MapDeleteEntity<Person>().WithName(RouteNames.DeletePerson);
    }
}
