using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.GenericCommands.GenericCreate;
using FinanceManager.Application.Common.GenericCommands.GenericDelete;
using FinanceManager.Application.Common.GenericCommands.GenericUpdate;
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
        var requestType = typeof(TRequest);
        var entityType = GetEntityType(requestType, typeof(ICreateRequest<>));
        var handlerType = typeof(GenericCreateHandler<,>).MakeGenericType(typeof(TRequest), entityType);

        // Make sure handler can be created by DI with no missing dependencies
        serviceProvider.GetRequiredService(handlerType);

        return BuildDelegateImpl<CreateCommandDelegate<TRequest>>(typeof(GenericCreateCommand<,>), entityType);
    }

    public UpdateCommandDelegate<TRequest> BuildUpdateCommandDelegate<TRequest>()
    where TRequest : IUpdateRequest
    {
        var requestType = typeof(TRequest);
        var entityType = GetEntityType(requestType, typeof(IUpdateRequest<>));
        var handlerType = typeof(GenericUpdateHandler<,>).MakeGenericType(typeof(TRequest), entityType);

        // Make sure handler can be created by DI with no missing dependencies
        serviceProvider.GetRequiredService(handlerType);

        return BuildDelegateImpl<UpdateCommandDelegate<TRequest>>(typeof(GenericUpdateCommand<,>), entityType);
    }

    public DeleteCommandDelegate<TRequest> BuildDeleteCommandDelegate<TRequest>()
        where TRequest : IDeleteRequest
    {
        var requestType = typeof(TRequest);
        var entityType = GetEntityType(requestType, typeof(IDeleteRequest<>));
        var handlerType = typeof(GenericDeleteHandler<,>).MakeGenericType(typeof(TRequest), entityType);

        // Make sure handler can be created by DI with no missing dependencies
        serviceProvider.GetRequiredService(handlerType);

        return BuildDelegateImpl<DeleteCommandDelegate<TRequest>>(typeof(GenericDeleteCommand<,>), entityType);
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

    private static TDelegate BuildDelegateImpl<TDelegate>(Type commandType, Type entityType)
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
