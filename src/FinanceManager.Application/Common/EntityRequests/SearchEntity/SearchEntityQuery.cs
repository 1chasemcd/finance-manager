using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.SearchEntity;

public sealed record SearchEntityQuery<TEntity, TResponse, TFilter>
    : IRequest<Result<SearchEntityResponse<TResponse>>>
    where TEntity : Entity
{
    public TFilter? Filter { get; init; }
    public int Take { get; init; } = 50;
    public int Skip { get; init; }
}
