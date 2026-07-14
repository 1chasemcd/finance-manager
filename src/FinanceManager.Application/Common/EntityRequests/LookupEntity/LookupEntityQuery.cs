using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.LookupEntity;

public sealed record LookupEntityQuery<TEntity, TResponse>(int Id) : IRequest<Result<TResponse>>
    where TEntity : Entity;
