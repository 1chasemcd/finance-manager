using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.ListEntities;

public sealed record ListEntitiesQuery<TRequest, TResponse, TEntity>(TRequest Request) : IRequest<Result<IReadOnlyList<TResponse>>>
    where TRequest : IFilterRequest<TEntity>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity;
