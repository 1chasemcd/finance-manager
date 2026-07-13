using System.Linq.Expressions;

namespace FinanceManager.Application.Abstractions.Services;

public interface IExpressionMapper<TSource, TDestination>
{
    Expression<Func<TSource, TDestination>> Map { get; }
}
