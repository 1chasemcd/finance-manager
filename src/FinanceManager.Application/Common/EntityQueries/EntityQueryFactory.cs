using System.Linq.Expressions;
using System.Reflection;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityQueries.GetEntity;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityQueries;

public sealed class EntityQueryFactory : IEntityQueryFactory
{
    public GetEntityQueryDelegate<TResponse> BuildGetEntityQueryDelegate<TResponse>()
        where TResponse : IGetResponse
    {
        Type responseType = typeof(TResponse);
        var entityType = GetEntityType(responseType, typeof(IGetResponse<>));
        return GenerateCompiledDelegate<GetEntityQueryDelegate<TResponse>>(typeof(GetEntityQuery<,>), entityType);
    }

    private static Type GetEntityType(Type type, Type openGenericInterfaceType)
    {
        Type? interfaceType = type
            .GetInterfaces()
            .FirstOrDefault(i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == openGenericInterfaceType);

        var genericArgs = interfaceType?.GetGenericArguments();
        if (genericArgs?.Length == 1)
            return genericArgs[0];

        throw new InvalidOperationException($"{type} must implement {openGenericInterfaceType}");
    }

    private static TDelegate GenerateCompiledDelegate<TDelegate>(Type queryType, Type entityType)
    {
        Type responseType = typeof(TDelegate).GetGenericArguments()[0];
        Type resultType = typeof(TDelegate).GetMethod("Invoke")?.ReturnType!;
        Type closedGenericQueryType = queryType
            .MakeGenericType(responseType, entityType);

        ParameterExpression requestParameter =
            Expression.Parameter(typeof(int), "id");

        MemberInfo requestProperty = closedGenericQueryType.GetProperty(
            nameof(GetEntityQuery<,>.Id))!;

        NewExpression ctor = Expression.New(closedGenericQueryType);

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
