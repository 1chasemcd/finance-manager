using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.UpdateEntity;

public sealed record UpdateEntityCommand<TRequest, TEntity>(TRequest Request)
    : IRequest<Result>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity;
