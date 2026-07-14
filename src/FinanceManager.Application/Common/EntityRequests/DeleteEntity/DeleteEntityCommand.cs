using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.DeleteEntity;

public sealed record DeleteEntityCommand<TEntity>(int Id) : IRequest<Result>
    where TEntity : Entity;
