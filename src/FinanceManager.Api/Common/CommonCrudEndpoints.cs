using System.Diagnostics.CodeAnalysis;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Abstractions.Services;
using MediatR;

namespace FinanceManager.Api.Common;

public static class CommonCrudEndpoints
{
    public static IEndpointConventionBuilder MapEntityCreate<TRequest>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/", string? getRouteName = null)
        where TRequest : ICreateRequest
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityCommandFactory>();
        var command = factory.BuildCreateDelegate<TRequest>();

        return endpoints.MapPost(pattern, async (TRequest request, ISender sender) =>
            (await sender.Send(command(request)))
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

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityCommandFactory>();
        var command = factory.BuildUpdateDelegate<TRequest>();

        return endpoints.MapPut(pattern, async (TRequest request, ISender sender) =>
            (await sender.Send(command(request))).ToHttpResult()
        );
    }

    public static IEndpointConventionBuilder MapEntityDelete<TRequest>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/")
    where TRequest : IDeleteRequest
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityCommandFactory>();
        var command = factory.BuildDeleteDelegate<TRequest>();

        return endpoints.MapDelete($"{pattern}/{{id}}", async (int id, ISender sender) =>
            (await sender.Send(command(id))).ToHttpResult()
        );
    }

    public static IEndpointConventionBuilder MapEntityGet<TResponse>(this IEndpointRouteBuilder endpoints, [StringSyntax("Route")] string pattern = "/")
        where TResponse : IGetResponse
    {
        pattern = ValidateRoutePattern(pattern);

        var factory = endpoints.ServiceProvider.GetRequiredService<IEntityQueryFactory>();
        var command = factory.BuildGetEntityQueryDelegate<TResponse>();

        return endpoints.MapGet($"{pattern}/{{id}}",
            async (int id, ISender sender) => (await sender.Send(command(id))).ToHttpResult()
        );
    }

    private static string ValidateRoutePattern(string pattern)
    {
        pattern = pattern.TrimEnd('/');
        return pattern;
    }
}
