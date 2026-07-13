using System.Diagnostics;
using System.Reflection;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.GetEntity;
using FinanceManager.Application.Common.EntityRequests.ListEntities;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Application.Common.Results;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityRequests;

public static class EntityRequestHandlerRegistration
{
    private static readonly Type[] s_messageInterfaces = [
        typeof(ICreateRequest<>),
        typeof(IUpdateRequest<>),
        typeof(IDeleteRequest<>),
        typeof(IGetResponse<>),
        typeof(IListRequest<>)
    ];

    public static IServiceCollection AddEntityRequestHandlers(this IServiceCollection serviceCollection, Assembly assembly)
    {
        var messageTypes = assembly.GetTypes()
            .Where(x => x.IsClass)
            .Where(x => x.GetInterfaces().Any(
                x => x.IsGenericType
                && s_messageInterfaces.Contains(x.GetGenericTypeDefinition())));

        foreach (var messageType in messageTypes)
            serviceCollection.AddHandlersForMessage(messageType);

        return serviceCollection;
    }

    private static void AddHandlersForMessage(this IServiceCollection serviceCollection, Type messageType)
    {
        var messageInterfaces = messageType.GetInterfaces()
            .Where(x =>
                x.IsGenericType
                && s_messageInterfaces.Contains(x.GetGenericTypeDefinition()))
            .ToList();

        foreach (var messageInterface in messageInterfaces)
        {
            if (messageInterface.GetGenericTypeDefinition() == typeof(IListRequest<>))
                serviceCollection.AddHandlersForListMessage(messageType, messageInterface);
            else
                serviceCollection.AddHandlerForMessage(messageType, messageInterface);
        }
    }

    private static void AddHandlerForMessage(this IServiceCollection serviceCollection, Type messageType, Type messageInterface)
    {
        var entityType = messageInterface.GenericTypeArguments[0];
        var openInterfaceType = messageInterface.GetGenericTypeDefinition();

        Type requestType;
        Type resultType;
        Type handlerType;
        if (openInterfaceType == typeof(ICreateRequest<>))
        {
            requestType = typeof(CreateEntityCommand<,>).MakeGenericType(messageType, entityType);
            resultType = typeof(Result<int>);
            handlerType = typeof(CreateEntityHandler<,>);
        }
        else if (openInterfaceType == typeof(IUpdateRequest<>))
        {
            requestType = typeof(UpdateEntityCommand<,>).MakeGenericType(messageType, entityType);
            resultType = typeof(Result);
            handlerType = typeof(UpdateEntityHandler<,>);

        }
        else if (openInterfaceType == typeof(IDeleteRequest<>))
        {
            requestType = typeof(DeleteEntityCommand<,>).MakeGenericType(messageType, entityType);
            resultType = typeof(Result);
            handlerType = typeof(DeleteEntityHandler<,>);

        }
        else if (openInterfaceType == typeof(IGetResponse<>))
        {
            requestType = typeof(GetEntityQuery<,>).MakeGenericType(messageType, entityType);
            resultType = typeof(Result<>).MakeGenericType(messageType);
            handlerType = typeof(GetEntityHandler<,>);

        }
        else throw new UnreachableException();

        var handlerInterfaceType = typeof(IRequestHandler<,>).MakeGenericType(requestType, resultType);
        var closedHandlerType = handlerType.MakeGenericType(messageType, entityType);
        serviceCollection.AddTransient(handlerInterfaceType, closedHandlerType);
    }

    private static void AddHandlersForListMessage(this IServiceCollection serviceCollection, Type messageType, Type messageInterface)
    {
        var entityType = messageInterface.GenericTypeArguments[0];

        var responseTypes = messageType.Assembly.GetTypes()
            .Where(x => x.IsClass)
            .Where(x => x.GetInterfaces().Any(
                x => x.IsGenericType
                && x.GetGenericTypeDefinition() == typeof(IGetResponse<>)
                && x.GetGenericArguments()[0] == entityType));

        foreach (var responseType in responseTypes)
        {
            var requestType = typeof(ListEntitiesQuery<,,>).MakeGenericType(messageType, responseType, entityType);
            var resultType = typeof(Result<>).MakeGenericType(typeof(IReadOnlyList<>).MakeGenericType(responseType));

            var handlerInterfaceType = typeof(IRequestHandler<,>).MakeGenericType(requestType, resultType);
            var handlerType = typeof(ListEntitiesHandler<,,>).MakeGenericType(messageType, responseType, entityType);

            serviceCollection.AddTransient(handlerInterfaceType, handlerType);
        }
    }
}
