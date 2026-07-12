using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.DeleteEntity;

public sealed record DeleteEntityCommand<TRequest, TEntity>(TRequest Request)
    : IRequest<Result>
    where TRequest : IDeleteRequest<TEntity>
    where TEntity : Entity;
