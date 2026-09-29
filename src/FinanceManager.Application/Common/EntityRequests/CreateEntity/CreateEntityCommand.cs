using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.CreateEntity;

public sealed record CreateEntityCommand<TEntity, TRequest>(TRequest Request)
    : IRequest<Result<int>>, ITransactionCommand
    where TEntity : Entity;
