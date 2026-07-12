using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.GenericUpdate;

public sealed record GenericUpdateCommand<TRequest, TEntity> : IRequest<Result>, IGenericCommand<TRequest>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity
{
    public required TRequest Request { get; init; }
}
