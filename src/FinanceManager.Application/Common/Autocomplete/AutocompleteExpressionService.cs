using System.Linq.Expressions;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Common.Autocomplete;

internal sealed class AutocompleteExpressionService
{
    public Expression<Func<TEntity, AutocompleteQueryResponse>> BuildResponseTransformExpression<TEntity>(
        AutocompleteDisplayTransform<TEntity> displayTransform)
        where TEntity : Entity
    {
        var parameter = displayTransform.TransformExpression.Parameters[0];

        var idProperty = Expression.Property(parameter, nameof(Entity.Id));

        var constructor = typeof(AutocompleteQueryResponse)
            .GetConstructor([typeof(int), typeof(string)]);

        var newExpression = Expression.New(
            constructor!,
            idProperty,
            displayTransform.TransformExpression.Body
        );

        return Expression.Lambda<Func<TEntity, AutocompleteQueryResponse>>(
            newExpression,
            parameter
        );
    }

    public Expression<Func<TEntity, bool>> BuildContainsExpression<TEntity>(
        AutocompleteDisplayTransform<TEntity> displayTransform, string searchText)
        where TEntity : Entity
    {
        var entityParameter = displayTransform.TransformExpression.Parameters[0];

        var containsMethod = typeof(string).GetMethod(
            nameof(string.Contains), [typeof(string)])!;

        var containsCall = Expression.Call(
            displayTransform.TransformExpression.Body,
            containsMethod,
            Expression.Constant(searchText));

        return Expression.Lambda<Func<TEntity, bool>>(
            containsCall,
            entityParameter
        );
    }
}
