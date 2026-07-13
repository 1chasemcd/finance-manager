using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.GetEntity;
using FinanceManager.Application.Common.EntityRequests.ListEntities;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests;

internal sealed class EntityRequestFactory : IEntityRequestFactory
{
    public Func<TRequest, IRequest<Result<int>>> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest
    {
        return BuildCommandDelegate<Func<TRequest, IRequest<Result<int>>>>(
            typeof(CreateEntityCommand<,>));
    }

    public Func<TRequest, IRequest<Result>> BuildUpdateDelegate<TRequest>()
    where TRequest : IUpdateRequest
    {
        return BuildCommandDelegate<Func<TRequest, IRequest<Result>>>(
            typeof(UpdateEntityCommand<,>));
    }

    public Func<TRequest, IRequest<Result>> BuildDeleteDelegate<TRequest>()
        where TRequest : IDeleteRequest
    {
        return BuildCommandDelegate<Func<TRequest, IRequest<Result>>>(
            typeof(DeleteEntityCommand<,>));
    }

    public Func<int, IRequest<Result<TResponse>>> BuildGetDelegate<TResponse>()
    where TResponse : IGetResponse
    {
        var responseType = typeof(TResponse);
        var entityType = GetEntityType(responseType);
        var queryType = typeof(GetEntityQuery<,>);

        var closedQueryType = queryType.MakeGenericType(responseType, entityType);
        return GenerateCompiledDelegate<Func<int, IRequest<Result<TResponse>>>>(closedQueryType);
    }

    public Func<TRequest, IRequest<Result<IReadOnlyList<TResponse>>>> BuildListDelegate<TRequest, TResponse>()
        where TRequest : IListRequest
        where TResponse : IGetResponse
    {
        var requestType = typeof(TRequest);
        var responseType = typeof(TResponse);
        var entityType = GetEntityType(responseType);
        if (entityType != GetEntityType(requestType))
            throw new InvalidOperationException(
                $"{typeof(TRequest).Name} and {typeof(TResponse).Name} correspond to different entities");

        var queryType = typeof(ListEntitiesQuery<,,>);

        var closedQueryType = queryType.MakeGenericType(requestType, responseType, entityType);
        return GenerateCompiledDelegate<Func<TRequest, IRequest<Result<IReadOnlyList<TResponse>>>>>(closedQueryType);
    }

    private static TDelegate BuildCommandDelegate<TDelegate>(Type commandType)
    {
        var requestType = typeof(TDelegate).GetMethod("Invoke")!.GetParameters()[0].ParameterType;
        var entityType = GetEntityType(requestType);

        var closedCommandType = commandType.MakeGenericType(requestType, entityType);
        return GenerateCompiledDelegate<TDelegate>(closedCommandType);
    }

    private static Type GetEntityType(Type genericEntityTypeContainer)
    {
        var openGenericInterfaceTypes = new[] {
            typeof(ICreateRequest<>),
            typeof(IUpdateRequest<>),
            typeof(IDeleteRequest<>),
            typeof(IGetResponse<>),
            typeof(IListRequest<>)
        };

        Type? interfaceType = genericEntityTypeContainer
            .GetInterfaces()
            .FirstOrDefault(i =>
                i.IsGenericType &&
                openGenericInterfaceTypes.Contains(i.GetGenericTypeDefinition()));

        var genericArgs = interfaceType?.GetGenericArguments();
        if (genericArgs?.Length == 1)
            return genericArgs[0];

        throw new InvalidOperationException(
            $"Request must implement one of {openGenericInterfaceTypes.Select(x => x.Name)}");
    }

    private static TDelegate GenerateCompiledDelegate<TDelegate>(Type commandOrQueryType)
    {
        MethodInfo invoke = typeof(TDelegate).GetMethod("Invoke")!;
        Type requestType = invoke.GetParameters()[0].ParameterType;
        Type resultType = invoke.ReturnType;

        ParameterExpression requestParameter =
            Expression.Parameter(requestType, "x");

        ConstructorInfo ctor = commandOrQueryType.GetConstructor([requestType])
            ?? throw new InvalidOperationException(
                $"No constructor found on {commandOrQueryType} accepting {requestType}.");

        NewExpression newCall = Expression.New(ctor, requestParameter);

        UnaryExpression castResult = Expression.Convert(newCall, resultType);

        return Expression
            .Lambda<TDelegate>(
                castResult,
                requestParameter)
            .Compile();
    }
}
