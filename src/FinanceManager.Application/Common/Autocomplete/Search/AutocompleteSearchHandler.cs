using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.Autocomplete.Search;

internal sealed class AutocompleteSearchHandler<TEntity, TFilter>(
    IApplicationDbContext db,
    AutocompleteExpressionService expressionService,
    AutocompleteDisplayTransform<TEntity> displayTransform,
    IEntityFilterHandler<TEntity, TFilter>? queryBuilder = null)
    : IRequestHandler<AutocompleteSearchQuery<TEntity, TFilter>, Result<IReadOnlyList<AutocompleteQueryResponse>>>
    where TEntity : Entity

{
    public async Task<Result<IReadOnlyList<AutocompleteQueryResponse>>> Handle(
        AutocompleteSearchQuery<TEntity, TFilter> query,
        CancellationToken cancellationToken)
    {
        var entities = db.Set<TEntity>().AsNoTracking();
        IQueryable<TEntity> results;

        if (EqualityComparer<TFilter>.Default.Equals(query.Filter, default))
            results = entities;
        else if (queryBuilder != null)
            results = queryBuilder.ApplyFilter(query.Filter!, entities);
        else
            throw new InvalidOperationException(); // TODO log

        var transormToResponse = expressionService.BuildResponseTransformExpression(displayTransform);
        var checkContains = expressionService.BuildContainsExpression(displayTransform, query.Search);

        return await results
            .Where(checkContains)
            .Select(transormToResponse)
            .Skip(query.Skip)
            .Take(query.Take)
            .ToListAsync(cancellationToken);
    }
}
