using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.GenericCreate;

public sealed record GenericCreateCommand<TRequest, TEntity> : IRequest<Result<int>>, IGenericCommand<TRequest>
    where TRequest : ICreateRequest<TEntity>
    where TEntity : Entity
{
    public required TRequest Request { get; init; }
}
