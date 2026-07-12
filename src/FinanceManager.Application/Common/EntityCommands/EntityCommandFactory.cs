using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;
using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands;

public sealed class EntityCommandFactory : IEntityCommandFactory
{
    public Func<TRequest, IRequest<Result<int>>> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest
    {
        return BuildDelegate<Func<TRequest, IRequest<Result<int>>>>(
            typeof(CreateEntityHandler<,>),
            typeof(CreateEntityCommand<,>));
    }

    public Func<TRequest, IRequest<Result>> BuildUpdateDelegate<TRequest>()
    where TRequest : IUpdateRequest
    {
        return BuildDelegate<Func<TRequest, IRequest<Result>>>(
            typeof(UpdateEntityHandler<,>),
            typeof(UpdateEntityCommand<,>));
    }

    public Func<TRequest, IRequest<Result>> BuildDeleteDelegate<TRequest>()
        where TRequest : IDeleteRequest
    {
        return BuildDelegate<Func<TRequest, IRequest<Result>>>(
            typeof(DeleteEntityHandler<,>),
            typeof(DeleteEntityCommand<,>));
    }

    private TDelegate BuildDelegate<TDelegate>(Type handlerType, Type commandType)
    {
        var requestType = typeof(TDelegate).GetMethod("Invoke")!.GetParameters()[0].ParameterType;
        var entityType = GetEntityType(requestType);

        var closedCommandType = commandType.MakeGenericType(requestType, entityType);
        return GenerateCompiledDelegate<TDelegate>(closedCommandType);
    }

    private static Type GetEntityType(Type requestType)
    {
        var openGenericInterfaceTypes = new[] { typeof(ICreateRequest<>), typeof(IUpdateRequest<>), typeof(IDeleteRequest<>) };
        Type? interfaceType = requestType
            .GetInterfaces()
            .FirstOrDefault(i =>
                i.IsGenericType &&
                openGenericInterfaceTypes.Contains(i.GetGenericTypeDefinition()));

        var genericArgs = interfaceType?.GetGenericArguments();
        if (genericArgs?.Length == 1)
            return genericArgs[0];

        throw new InvalidOperationException(
            $"Request must implement one of {typeof(ICreateRequest<>)}, {typeof(IUpdateRequest<>)}, {typeof(IDeleteRequest<>)}");
    }

    private static TDelegate GenerateCompiledDelegate<TDelegate>(Type commandType)
    {
        MethodInfo invoke = typeof(TDelegate).GetMethod("Invoke")!;
        Type requestType = invoke.GetParameters()[0].ParameterType;
        Type resultType = invoke.ReturnType;

        ParameterExpression requestParameter =
            Expression.Parameter(requestType, "x");

        ConstructorInfo ctor = commandType.GetConstructor([requestType])
            ?? throw new InvalidOperationException(
                $"No constructor found on {commandType} accepting {requestType}.");

        NewExpression newCall = Expression.New(ctor, requestParameter);

        UnaryExpression castResult = Expression.Convert(newCall, resultType);

        return Expression
            .Lambda<TDelegate>(
                castResult,
                requestParameter)
            .Compile();
    }
}
