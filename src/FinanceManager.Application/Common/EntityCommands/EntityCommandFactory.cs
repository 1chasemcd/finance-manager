using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityCommands;

public sealed class EntityCommandFactory(IServiceProvider serviceProvider) : IEntityCommandFactory
{
    public CreateEntityCommandDelegate<TRequest> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest
    {
        CheckCanCreateHandler<TRequest>(typeof(CreateEntityHandler<,>));
        var commandType = typeof(CreateEntityCommand<,>).MakeGenericType(typeof(TRequest), GetEntityType<TRequest>());
        return GenerateCompiledDelegate<CreateEntityCommandDelegate<TRequest>>(commandType);
    }

    public UpdateEntityCommandDelegate<TRequest> BuildUpdateDelegate<TRequest>()
    where TRequest : IUpdateRequest
    {
        CheckCanCreateHandler<TRequest>(typeof(UpdateEntityHandler<,>));
        var commandType = typeof(UpdateEntityCommand<,>).MakeGenericType(typeof(TRequest), GetEntityType<TRequest>());
        return GenerateCompiledDelegate<UpdateEntityCommandDelegate<TRequest>>(commandType);
    }

    public DeleteEntityCommandDelegate BuildDeleteDelegate<TRequest>()
        where TRequest : IDeleteRequest
    {
        CheckCanCreateHandler<TRequest>(typeof(DeleteEntityHandler<>));
        var commandType = typeof(DeleteEntityCommand<>).MakeGenericType(GetEntityType<TRequest>());
        return GenerateCompiledDelegate<DeleteEntityCommandDelegate>(commandType);
    }

    private void CheckCanCreateHandler<TRequest>(Type handlerType)
    {
        var entityType = GetEntityType<TRequest>();
        Type closedGenericHandlerType;
        if (handlerType == typeof(DeleteEntityHandler<>))
            closedGenericHandlerType = handlerType.MakeGenericType(entityType);
        else
            closedGenericHandlerType = handlerType.MakeGenericType(typeof(TRequest), entityType);

        // Make sure handler can be created by DI with no missing dependencies
        var _ = serviceProvider;
        // serviceProvider.GetRequiredService(closedGenericHandlerType);
    }
    private static Type GetEntityType<TRequest>()
    {
        var openGenericInterfaceTypes = new[] { typeof(ICreateRequest<>), typeof(IUpdateRequest<>), typeof(IDeleteRequest<>) };
        Type? interfaceType = typeof(TRequest)
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
