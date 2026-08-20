using FinanceManager.Api.Common;
using FinanceManager.Domain.People;

namespace FinanceManager.Api.Endpoints;

internal static class PersonEndpoints
{
    public static void RegisterPersonEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/people");
        group.MapLookupEntity<Person>();
        group.MapSearchEntity<Person>();
        group.MapCreateEntity<Person>();
        group.MapUpdateEntity<Person>();
        group.MapDeleteEntity<Person>();
    }
}
