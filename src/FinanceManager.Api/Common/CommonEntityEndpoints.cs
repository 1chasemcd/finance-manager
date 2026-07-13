using System.Diagnostics.CodeAnalysis;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Abstractions.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

public static class CommonEntityEndpoints
{
    public static IEndpointConventionBuilder MapEntityCreate<TRequest>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/", string? getRouteName = null)
        where TRequest : ICreateRequest
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityRequestFactory>();
        var message = factory.BuildCreateDelegate<TRequest>();

        return endpoints.MapPost(pattern, async ([FromBody] TRequest request, ISender sender) =>
            (await sender.Send(message(request)))
                .ToHttpResult(result => getRouteName == null
                    ? TypedResults.Created()
                    : TypedResults.CreatedAtRoute(
                        getRouteName,
                        new { id = result }
                ))
        );
    }

    public static IEndpointConventionBuilder MapEntityUpdate<TRequest>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/")
        where TRequest : IUpdateRequest
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityRequestFactory>();
        var message = factory.BuildUpdateDelegate<TRequest>();

        return endpoints.MapPut(pattern, async ([FromBody] TRequest request, ISender sender) =>
            (await sender.Send(message(request))).ToHttpResult()
        );
    }

    public static IEndpointConventionBuilder MapEntityDelete<TRequest>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/")
    where TRequest : IDeleteRequest, new()
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityRequestFactory>();
        var message = factory.BuildDeleteDelegate<TRequest>();

        return endpoints.MapDelete($"{pattern}/{{id}}", async (int id, ISender sender) =>
            (await sender.Send(message(new TRequest() { Id = id }))).ToHttpResult()
        );
    }

    public static IEndpointConventionBuilder MapEntityGet<TResponse>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/")
        where TResponse : IGetResponse
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityRequestFactory>();
        var message = factory.BuildGetDelegate<TResponse>();

        return endpoints.MapGet($"{pattern}/{{id}}",
            async (int id, ISender sender) => (await sender.Send(message(id))).ToHttpResult()
        );
    }

    public static IEndpointConventionBuilder MapEntityList<TRequest, TResponse>(
        this IEndpointRouteBuilder endpoints,
        [StringSyntax("Route")] string pattern = "/")
        where TRequest : IListRequest
        where TResponse : IGetResponse
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityRequestFactory>();
        var message = factory.BuildListDelegate<TRequest, TResponse>();

        return endpoints.MapPost($"{pattern}/list",
            async (TRequest request, ISender sender) => (await sender.Send(message(request))).ToHttpResult()
        );
    }

    private static string ValidateRoutePattern(string pattern)
    {
        pattern = pattern.TrimEnd('/');
        return pattern;
    }
}
