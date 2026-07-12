using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.GenericCommands.CreateEntity;
using FinanceManager.Application.Common.GenericCommands.DeleteEntity;
using FinanceManager.Application.Common.GenericCommands.UpdateEntity;
using FinanceManager.Application.Common.Results;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.GenericCommands;

public delegate IRequest<Result<int>> CreateCommandDelegate<TRequest>(TRequest request);
public delegate IRequest<Result> DeleteCommandDelegate<TRequest>(TRequest request);
public delegate IRequest<Result> UpdateCommandDelegate<TRequest>(TRequest request);

public sealed class GenericCommandFactory(IServiceProvider serviceProvider)
{
    public CreateCommandDelegate<TRequest> BuildCreateCommandDelegate<TRequest>()
        where TRequest : ICreateRequest
    {
        return BuildCommandDelegateImpl<CreateCommandDelegate<TRequest>>(
            typeof(ICreateRequest<>),
            typeof(CreateEntityHandler<,>),
            typeof(CreateEntityCommand<,>)
        );
    }

    public UpdateCommandDelegate<TRequest> BuildUpdateCommandDelegate<TRequest>()
    where TRequest : IUpdateRequest
    {
        return BuildCommandDelegateImpl<UpdateCommandDelegate<TRequest>>(
            typeof(IUpdateRequest<>),
            typeof(UpdateEntityHandler<,>),
            typeof(UpdateEntityCommand<,>)
        );
    }

    public DeleteCommandDelegate<TRequest> BuildDeleteCommandDelegate<TRequest>()
        where TRequest : IDeleteRequest
    {
        return BuildCommandDelegateImpl<DeleteCommandDelegate<TRequest>>(
            typeof(IDeleteRequest<>),
            typeof(DeleteEntityHandler<,>),
            typeof(DeleteEntityCommand<,>)
        );
    }

    private TDelegate BuildCommandDelegateImpl<TDelegate>(Type requestInterfaceType, Type handlerType, Type commandType)
    {
        Type requestType = typeof(TDelegate).GetGenericArguments()[0];
        var entityType = GetEntityType(requestType, requestInterfaceType);
        var closedGenericHandlerType = handlerType.MakeGenericType(requestType, entityType);

        // Make sure handler can be created by DI with no missing dependencies
        serviceProvider.GetRequiredService(closedGenericHandlerType);

        return GenerateCompiledDelegate<TDelegate>(commandType, entityType);
    }

    private static Type GetEntityType(Type requestType, Type openGenericInterfaceType)
    {
        Type? interfaceType = requestType
            .GetInterfaces()
            .FirstOrDefault(i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == openGenericInterfaceType);

        var genericArgs = interfaceType?.GetGenericArguments();
        if (genericArgs?.Length == 1)
            return genericArgs[0];

        throw new InvalidOperationException($"Request must implement {openGenericInterfaceType}");
    }

    private static TDelegate GenerateCompiledDelegate<TDelegate>(Type commandType, Type entityType)
    {
        Type requestType = typeof(TDelegate).GetGenericArguments()[0];
        Type resultType = typeof(TDelegate).GetMethod("Invoke")?.ReturnType
            ?? throw new InvalidOperationException("TDelegate must be a delegate");
        Type closedGenericCommandType = commandType
            .MakeGenericType(requestType, entityType);

        ParameterExpression requestParameter =
            Expression.Parameter(requestType, "request");

        MemberInfo requestProperty = closedGenericCommandType.GetProperty(
            nameof(IGenericCommand<>.Request))!;

        NewExpression ctor = Expression.New(closedGenericCommandType);

        MemberInitExpression init = Expression.MemberInit(
            ctor,
            Expression.Bind(
                requestProperty,
                requestParameter));

        UnaryExpression castResult = Expression.Convert(init, resultType);

        return Expression
            .Lambda<TDelegate>(
                castResult,
                requestParameter)
            .Compile();
    }
}
