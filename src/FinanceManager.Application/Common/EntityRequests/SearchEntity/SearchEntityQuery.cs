using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.SearchEntity;

public sealed record SearchEntityQuery<TEntity, TFilter, TResponse>
    : IRequest<Result<IReadOnlyList<TResponse>>>
    where TEntity : Entity
{
    public TFilter? Filter { get; init; }
    [Range(0, 50)]
    [DefaultValue(50)]
    public int Take { get; init; } = 50;
    [Range(0, int.MaxValue)]
    public int Skip { get; init; }
}
