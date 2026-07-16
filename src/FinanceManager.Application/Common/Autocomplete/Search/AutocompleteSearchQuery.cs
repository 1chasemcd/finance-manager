using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.Autocomplete.Search;

public sealed record AutocompleteSearchQuery<TEntity, TFilter>
    : IRequest<Result<IReadOnlyList<AutocompleteQueryResponse>>>
    where TEntity : Entity
{
    public TFilter? Filter { get; init; }
    public required string Search { get; init; }
    public int Take { get; init; } = 50;
    public int Skip { get; init; }
}
