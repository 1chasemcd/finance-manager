using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.UpdateEntity;

public sealed record UpdateEntityCommand<TRequest, TEntity>(TRequest Request)
    : IRequest<Result>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity;
