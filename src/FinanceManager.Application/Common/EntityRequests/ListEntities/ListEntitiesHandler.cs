using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.EntityRequests.GetEntity;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;

namespace FinanceManager.Application.Common.EntityRequests.ListEntities;

public class ListEntitiesHandler<TRequest, TResponse, TEntity>(
    IApplicationDbContext db,
    IEntityListFilterHandler<TRequest, TEntity> filter,
    IExpressionMapper<TEntity, TResponse> mapper)
    : IRequestHandler<ListEntitiesQuery<TRequest, TResponse, TEntity>, Result<IReadOnlyList<TResponse>>>
    where TRequest : IListRequest<TEntity>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity

{
    public async Task<Result<IReadOnlyList<TResponse>>> Handle(ListEntitiesQuery<TRequest, TResponse, TEntity> command, CancellationToken cancellationToken)
    {
        var query = db.Set<TEntity>();
        var results = filter.ApplyFilter(command.Request, query);
        return results.Skip(command.Request.Skip)
            .Take(command.Request.Take)
            .Select(mapper.Map).ToList();
    }
}
