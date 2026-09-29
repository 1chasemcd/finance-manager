using System.Linq.Expressions;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Common.Autocomplete;

internal sealed record AutocompleteDisplayTransform<TEntity>(
    Expression<Func<TEntity, string>> TransformExpression)
    where TEntity : Entity;
