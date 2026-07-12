using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.GenericDelete;

public sealed record GenericDeleteCommand<TRequest, TEntity> : IRequest<Result>, IGenericCommand<TRequest>
    where TRequest : IDeleteRequest<TEntity>
    where TEntity : Entity
{
    public required TRequest Request { get; init; }
}
