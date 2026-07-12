using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.CreateEntity;

public sealed record CreateEntityCommand<TRequest, TEntity>(TRequest Request)
    : IRequest<Result<int>>
    where TRequest : ICreateRequest<TEntity>
    where TEntity : Entity;
