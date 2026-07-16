using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Autocomplete.Search;
using FinanceManager.Application.Common.Autocomplete.Single;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

static class AutocompleteEndpoints
{
    public static void MapAutocomplete<TEntity>(this IEndpointRouteBuilder endpoints)
        where TEntity : Entity
    {
        var routeName = typeof(TEntity).Name.ToLower();
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityAssociationRegistry>();
        var filterType = registry.For<TEntity>().GetOptional(EntityAssociationFeature.EntityAutocompleteFilter);

        MapAutocompleteSingleImpl<TEntity>(endpoints, routeName);

        if (filterType == null)
            MapUnfilteredAutocompleteSearchImpl<TEntity>(endpoints, routeName);
        else
            typeof(AutocompleteEndpoints)
                .GetMethod(nameof(MapAutocompleteSearchImpl), BindingFlags.Static | BindingFlags.NonPublic)!
                .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), filterType);

    }

    private static void MapAutocompleteSingleImpl<TEntity>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        endpoints.MapGet($"{pattern}/{{id}}",
            async (int id, ISender sender, CancellationToken cancellationToken) =>
            {
                var query = new AutocompleteSingleQuery<TEntity>(id);
                var result = await sender.Send(query, cancellationToken);
                return result.ToHttpResult();
            });
    }

    private static void MapAutocompleteSearchImpl<TEntity, TFilter>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        endpoints.MapPost($"{pattern}",
            async ([FromBody] AutocompleteSearchQuery<TEntity, TFilter> query,
            ISender sender,
            CancellationToken cancellationToken)
                => (await sender.Send(query, cancellationToken)).ToHttpResult()
        );
    }

    private static void MapUnfilteredAutocompleteSearchImpl<TEntity>(
    IEndpointRouteBuilder endpoints,
    string pattern)
    where TEntity : Entity
    {
        endpoints.MapPost($"{pattern}",
            async ([FromBody] UnfilteredSearchEntityRequest request,
            ISender sender,
            CancellationToken cancellationToken) =>
            {
                var query = new AutocompleteSearchQuery<TEntity, Unit>
                {
                    Search = request.Search,
                    Take = request.Take,
                    Skip = request.Skip
                };
                return (await sender.Send(query, cancellationToken)).ToHttpResult();
            }
        );
    }

    private sealed record UnfilteredSearchEntityRequest
    {
        public required string Search { get; init; }
        public int Take { get; init; } = 50;
        public int Skip { get; init; }
    }
}
