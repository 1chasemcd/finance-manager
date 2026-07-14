using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.UpdateEntity;

public sealed record UpdateEntityCommand<TEntity, TRequest>(
    int Id,
    TRequest Request) : IRequest<Result>
    where TEntity : Entity;
