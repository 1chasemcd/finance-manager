using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityQueries.GetEntity;

public sealed record GetEntityQuery<TResponse, TEntity> : IRequest<Result<TResponse>>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity
{
    public required int Id { get; init; }
}
