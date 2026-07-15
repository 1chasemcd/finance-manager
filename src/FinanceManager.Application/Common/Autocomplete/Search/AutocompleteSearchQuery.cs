using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.Autocomplete.Search;

public sealed record AutocompleteSearchQuery<TEntity, TFilter>
    : IRequest<Result<IReadOnlyList<AutocompleteQueryResponse>>>
    where TEntity : Entity
{
    public TFilter? Filter { get; init; }
    [MaxLength(500)]
    public required string Search { get; init; }
    [Range(0, 50)]
    [DefaultValue(50)]
    public int Take { get; init; } = 50;
    [Range(0, int.MaxValue)]
    public int Skip { get; init; }
}
