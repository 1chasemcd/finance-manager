using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.DeleteEntity;

public sealed record DeleteEntityCommand<TRequest, TEntity>(int Id) : IRequest<Result>
    where TRequest : IDeleteRequest<TEntity>
    where TEntity : Entity;
