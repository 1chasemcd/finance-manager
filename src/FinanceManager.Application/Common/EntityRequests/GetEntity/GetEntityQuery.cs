using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.GetEntity;

public sealed record GetEntityQuery<TResponse, TEntity>(int Id) : IRequest<Result<TResponse>>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity;
