using System.Diagnostics;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;
using FinanceManager.Application.Common.EntityQueries.GetEntity;
using FinanceManager.Application.Common.Results;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityQueries;

public static class EntityQueryRegistration
{
    private static readonly Type[] s_queryResponseInterfaces = [typeof(IGetResponse<>)];

    public static void AddEntityQueryHandlers(this IServiceCollection serviceCollection, Assembly assembly)
    {
        var responseTypes = assembly.GetTypes()
            .Where(x => x.IsClass)
            .Where(x => x.GetInterfaces().Any(
                x => x.IsGenericType
                && s_queryResponseInterfaces.Contains(x.GetGenericTypeDefinition())));

        foreach (var responseType in responseTypes)
            serviceCollection.AddHandlersForResponse(responseType);
    }

    private static void AddHandlersForResponse(this IServiceCollection serviceCollection, Type responseType)
    {
        var responseInterfaces = responseType.GetInterfaces()
            .Where(x =>
                x.IsGenericType
                && s_queryResponseInterfaces.Contains(x.GetGenericTypeDefinition()))
            .ToList();

        foreach (var interfaceType in responseInterfaces)
            serviceCollection.AddHandlerForResponse(responseType, interfaceType);
    }

    private static void AddHandlerForResponse(this IServiceCollection serviceCollection, Type responseType, Type interfaceType)
    {
        var entityType = interfaceType.GenericTypeArguments[0];
        var openInterfaceType = interfaceType.GetGenericTypeDefinition();

        Type queryType;
        Type handlerType;
        if (openInterfaceType == typeof(IGetResponse<>))
        {
            queryType = typeof(GetEntityQuery<,>);
            handlerType = typeof(GetEntityHandler<,>);
        }
        else throw new UnreachableException();

        var closedCommandType = queryType.MakeGenericType(responseType, entityType);
        var resultType = typeof(Result<>).MakeGenericType(responseType);
        var handlerInterfaceType = typeof(IRequestHandler<,>).MakeGenericType(closedCommandType, resultType);
        var closedHandlerType = handlerType.MakeGenericType(responseType, entityType);
        serviceCollection.AddTransient(handlerInterfaceType, closedHandlerType);
    }
}
