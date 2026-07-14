using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;

namespace FinanceManager.Application.Common.EntityRequests.ListEntities;

internal sealed class ListEntitiesHandler<TEntity, TRequest, TResponse>(
    IApplicationDbContext db,
    IEntityFilterHandler<TEntity, TRequest> queryBuilder,
    IExpressionMapper<TEntity, TResponse> mapper)
    : IRequestHandler<ListEntitiesQuery<TEntity, TRequest, TResponse>, Result<IReadOnlyList<TResponse>>>
    where TEntity : Entity

{
    public async Task<Result<IReadOnlyList<TResponse>>> Handle(ListEntitiesQuery<TEntity, TRequest, TResponse> query, CancellationToken cancellationToken)
    {
        var entities = db.Set<TEntity>();
        IQueryable<TEntity> results;

        if (query.Filter == null)
            results = entities;
        else
            results = queryBuilder.ApplyFilter(query.Filter, entities);

        return results.Skip(query.Skip)
            .Take(query.Take)
            .Select(mapper.Map).ToList();
    }
}
