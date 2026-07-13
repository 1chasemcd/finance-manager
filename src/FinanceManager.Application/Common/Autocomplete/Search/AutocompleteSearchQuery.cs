using System.Linq.Expressions;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.Autocomplete.Search;

public sealed record AutocompleteSearchQuery<TFilter, TEntity>
    : IRequest<Result<IReadOnlyList<KeyValuePair<int, string>>>>
    where TFilter : IFilterRequest<TEntity>
    where TEntity : Entity
{
    public required TFilter Filter { get; init; }
    public required string Search { get; init; }
    public required Expression<Func<TEntity, string>> Projection { get; init; }
}
