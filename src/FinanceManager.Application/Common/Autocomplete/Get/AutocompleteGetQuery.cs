using System.Linq.Expressions;
using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.Autocomplete.Get;

public sealed record AutocompleteGetQuery<TEntity> : IRequest<Result<string>>
{
    public int Id { get; init; }
    public required Expression<Func<TEntity, string>> Projection { get; init; }
}
