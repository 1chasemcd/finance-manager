using System.Linq.Expressions;

namespace FinanceManager.Application.Abstractions;

public interface IExpressionMapper<TSource, TDestination>
{
    Expression<Func<TSource, TDestination>> Map { get; }
}
