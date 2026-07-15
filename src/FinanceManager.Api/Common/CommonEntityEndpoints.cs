using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.LookupEntity;
using FinanceManager.Application.Common.EntityRequests.SearchEntity;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

static class CommonEntityEndpoints
{
    public static RouteHandlerBuilder MapCreateEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/",
        string? createdAt = null)
        where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityAssociationRegistry>();
        var requestType = registry.For<TEntity>().GetRequired(EntityAssociationFeature.EntityCreateRequest);
        var method = typeof(CommonEntityEndpoints)
            .GetMethod(nameof(MapCreateEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
            .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), requestType);

        return (RouteHandlerBuilder)method.Invoke(null, [endpoints, pattern, createdAt])!;
    }

    public static RouteHandlerBuilder MapUpdateEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
        where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityAssociationRegistry>();
        var requestType = registry.For<TEntity>().GetRequired(EntityAssociationFeature.EntityUpdateRequest);
        var method = typeof(CommonEntityEndpoints)
            .GetMethod(nameof(MapUpdateEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
            .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), requestType);

        return (RouteHandlerBuilder)method.Invoke(null, [endpoints, pattern])!;
    }

    public static RouteHandlerBuilder MapDeleteEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
        where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        return endpoints.MapDelete($"{pattern}/{{id}}",
            async (int id, ISender sender)
                => (await sender.Send(new DeleteEntityCommand<TEntity>(id))).ToHttpResult()
        );
    }

    public static RouteHandlerBuilder MapLookupEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
    where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityAssociationRegistry>();
        var responseType = registry.For<TEntity>().GetRequired(EntityAssociationFeature.EntityLookupResponse);
        var method = typeof(CommonEntityEndpoints)
            .GetMethod(nameof(MapLookupEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
            .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), responseType);

        return (RouteHandlerBuilder)method.Invoke(null, [endpoints, pattern])!;
    }

    public static RouteHandlerBuilder MapSearchEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
        where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityAssociationRegistry>();
        var filterType = registry.For<TEntity>().GetOptional(EntityAssociationFeature.EntitySearchFilter);
        var responseType = registry.For<TEntity>().GetRequired(EntityAssociationFeature.EntitySearchResponse);

        MethodInfo method;

        if (filterType == null)
            method = typeof(CommonEntityEndpoints)
                .GetMethod(nameof(MapUnfilteredSearchEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
                .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), responseType);
        else
            method = typeof(CommonEntityEndpoints)
                .GetMethod(nameof(MapSearchEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
                .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), filterType, responseType);


        return (RouteHandlerBuilder)method.Invoke(null, [endpoints, pattern])!;
    }

    private static RouteHandlerBuilder MapCreateEntityImpl<TEntity, TRequest>(
        IEndpointRouteBuilder endpoints,
        string pattern,
        string? createdAt)
        where TEntity : Entity
    {
        return endpoints.MapPost(pattern,
            async ([FromBody] TRequest request, ISender sender) =>
            {
                var command = new CreateEntityCommand<TEntity, TRequest>(request);
                var result = await sender.Send(command);
                if (!result.IsSuccess) return result.Error.ToHttpResult<Created, CreatedAtRoute>();

                return createdAt is not null
                    ? TypedResults.CreatedAtRoute(createdAt, new { id = result.Value })
                    : TypedResults.Created();
            }
        );
    }

    private static RouteHandlerBuilder MapUpdateEntityImpl<TEntity, TRequest>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        return endpoints.MapPut($"{pattern}/{{id}}",
            async (int id, [FromBody] TRequest request, ISender sender) =>
            {
                var command = new UpdateEntityCommand<TEntity, TRequest>(id, request);
                return (await sender.Send(command)).ToHttpResult();
            }
        );
    }

    private static RouteHandlerBuilder MapLookupEntityImpl<TEntity, TResponse>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        return endpoints.MapGet($"{pattern}/{{id}}",
            async (int id, ISender sender) =>
            {
                var query = new LookupEntityQuery<TEntity, TResponse>(id);
                return (await sender.Send(query)).ToHttpResult();
            }
        );
    }

    private static RouteHandlerBuilder MapSearchEntityImpl<TEntity, TFilter, TResponse>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        return endpoints.MapPost($"{pattern}/list",
            async ([FromBody] SearchEntityQuery<TEntity, TFilter, TResponse> query,
            ISender sender) => (await sender.Send(query)).ToHttpResult()
        );
    }

    private static RouteHandlerBuilder MapUnfilteredSearchEntityImpl<TEntity, TResponse>(
    IEndpointRouteBuilder endpoints,
    string pattern)
    where TEntity : Entity
    {
        return endpoints.MapPost($"{pattern}/list",
            async ([FromBody] UnfilteredSearchEntityRequest query,
            ISender sender) => (await sender.Send(
                new SearchEntityQuery<TEntity, Unit, TResponse>
                {
                    Take = query.Take,
                    Skip = query.Skip
                })).ToHttpResult()
        );
    }

    private static string ValidateRoutePattern(string pattern)
    {
        pattern = pattern.TrimEnd('/');
        return pattern;
    }

    private sealed record UnfilteredSearchEntityRequest
    {
        [Range(0, 50)]
        [DefaultValue(50)]
        public int Take { get; init; } = 50;
        [Range(0, int.MaxValue)]
        public int Skip { get; init; }
    }
}
