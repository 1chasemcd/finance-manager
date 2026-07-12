using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.CreateEntity;

public sealed record CreateEntityCommand<TRequest, TEntity> : IRequest<Result<int>>, IGenericCommand<TRequest>
    where TRequest : ICreateRequest<TEntity>
    where TEntity : Entity
{
    public required TRequest Request { get; init; }
}
