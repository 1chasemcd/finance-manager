using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.EntityRequests.SearchEntity;

internal sealed class SearchEntityHandler<TEntity, TResponse, TFilter>(
    IApplicationDbContext db,
    IExpressionMapper<TEntity, TResponse> mapper,
    IEntityFilterHandler<TEntity, TFilter>? queryBuilder = null)
    : IRequestHandler<SearchEntityQuery<TEntity, TResponse, TFilter>, Result<SearchEntityResponse<TResponse>>>
    where TEntity : Entity

{
    public async Task<Result<SearchEntityResponse<TResponse>>> Handle(SearchEntityQuery<TEntity, TResponse, TFilter> query, CancellationToken cancellationToken)
    {
        var entities = db.Set<TEntity>().AsNoTracking().OrderBy(x => x.Id);
        IQueryable<TEntity> results;

        if (EqualityComparer<TFilter>.Default.Equals(query.Filter, default))
            results = entities;
        else if (queryBuilder != null)
            results = queryBuilder.ApplyFilter(query.Filter!, entities);
        else
            throw new InvalidOperationException(); // TODO log

        var list = await results.Skip(query.Skip)
            .Take(query.Take)
            .Select(mapper.Map)
            .ToListAsync(cancellationToken);

        var count = await db.Set<TEntity>().AsNoTracking().CountAsync(cancellationToken);

        return new SearchEntityResponse<TResponse>
        {
            Results = list,
            Total = count
        };
    }
}
