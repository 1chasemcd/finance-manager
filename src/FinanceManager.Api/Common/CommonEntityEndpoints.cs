using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.ListEntities;
using FinanceManager.Application.Common.EntityRequests.LookupEntity;
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
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityTypeImplementationRegistry>();
        var requestType = registry.GetCreateEntityRequest<TEntity>();
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
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityTypeImplementationRegistry>();
        var requestType = registry.GetUpdateEntityRequest<TEntity>();
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
        return endpoints.MapDelete(pattern,
            async (DeleteEntityCommand<TEntity> request, ISender sender)
                => (await sender.Send(request)).ToHttpResult()
        );
    }

    public static RouteHandlerBuilder MapLookupEntity<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
    where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityTypeImplementationRegistry>();
        var responseType = registry.GetEntityResponse<TEntity>();
        var method = typeof(CommonEntityEndpoints)
            .GetMethod(nameof(MapLookupEntityImpl), BindingFlags.Static | BindingFlags.NonPublic)!
            .GetGenericMethodDefinition().MakeGenericMethod(typeof(TEntity), responseType);

        return (RouteHandlerBuilder)method.Invoke(null, [endpoints, pattern])!;
    }

    public static RouteHandlerBuilder MapListEntities<TEntity>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
        where TEntity : Entity
    {
        pattern = ValidateRoutePattern(pattern);
        var registry = endpoints.ServiceProvider.GetRequiredService<IEntityTypeImplementationRegistry>();
        var filterType = registry.GetEntityFilter<TEntity>();
        var responseType = registry.GetEntityResponse<TEntity>();

        var method = typeof(CommonEntityEndpoints)
            .GetMethod(nameof(MapListEntitiesImpl), BindingFlags.Static | BindingFlags.NonPublic)!
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
        return endpoints.MapPut($"pattern/{{id}}",
            async (int id, [FromBody] TRequest request, ISender sender) =>
            {
                var command = new UpdateEntityCommand<Entity, TRequest>(id, request);
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
                var query = new LookupEntityQuery<Entity, TResponse>(id);
                return (await sender.Send(query)).ToHttpResult();
            }
        );
    }

    private static RouteHandlerBuilder MapListEntitiesImpl<TEntity, TFilter, TResponse>(
        IEndpointRouteBuilder endpoints,
        string pattern)
        where TEntity : Entity
    {
        return endpoints.MapGet($"{pattern}/list",
            async ([FromBody] ListEntitiesQuery<Entity, TFilter, TResponse> query,
            ISender sender) => (await sender.Send(query)).ToHttpResult()
        );
    }

    private static string ValidateRoutePattern(string pattern)
    {
        pattern = pattern.TrimEnd('/');
        return pattern;
    }
}
