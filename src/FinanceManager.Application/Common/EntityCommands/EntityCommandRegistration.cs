using System.Diagnostics;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;
using FinanceManager.Application.Common.Results;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityCommands;

public static class EntityCommandRegistration
{
    private static readonly Type[] s_commandRequestInterfaces = [typeof(ICreateRequest<>), typeof(IUpdateRequest<>), typeof(IDeleteRequest<>)];

    public static void AddEntityCommandHandlers(this IServiceCollection serviceCollection, Assembly assembly)
    {
        var requestTypes = assembly.GetTypes()
            .Where(x => x.IsClass)
            .Where(x => x.GetInterfaces().Any(
                x => x.IsGenericType
                && s_commandRequestInterfaces.Contains(x.GetGenericTypeDefinition())));

        foreach (var requestType in requestTypes)
            serviceCollection.AddHandlersForRequest(requestType);
    }

    private static void AddHandlersForRequest(this IServiceCollection serviceCollection, Type requestType)
    {
        var requestInterfaces = requestType.GetInterfaces()
            .Where(x =>
                x.IsGenericType
                && s_commandRequestInterfaces.Contains(x.GetGenericTypeDefinition()))
            .ToList();

        foreach (var interfaceType in requestInterfaces)
            serviceCollection.AddHandlerForRequest(requestType, interfaceType);
    }

    private static void AddHandlerForRequest(this IServiceCollection serviceCollection, Type requestType, Type interfaceType)
    {
        var entityType = interfaceType.GenericTypeArguments[0];
        var openInterfaceType = interfaceType.GetGenericTypeDefinition();

        Type commandType;
        Type resultType;
        Type handlerType;
        if (openInterfaceType == typeof(ICreateRequest<>))
        {
            commandType = typeof(CreateEntityCommand<,>);
            resultType = typeof(Result<int>);
            handlerType = typeof(CreateEntityHandler<,>);
        }
        else if (openInterfaceType == typeof(IUpdateRequest<>))
        {
            commandType = typeof(UpdateEntityCommand<,>);
            resultType = typeof(Result);
            handlerType = typeof(UpdateEntityHandler<,>);

        }
        else if (openInterfaceType == typeof(IDeleteRequest<>))
        {
            commandType = typeof(DeleteEntityCommand<,>);
            resultType = typeof(Result);
            handlerType = typeof(DeleteEntityHandler<,>);

        }
        else throw new UnreachableException();

        var closedCommandType = commandType.MakeGenericType(requestType, entityType);
        var handlerInterfaceType = typeof(IRequestHandler<,>).MakeGenericType(closedCommandType, resultType);
        var closedHandlerType = handlerType.MakeGenericType(requestType, entityType);
        serviceCollection.AddTransient(handlerInterfaceType, closedHandlerType);
    }
}
