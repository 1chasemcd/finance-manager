using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.Autocomplete.Single;

internal sealed class AutocompleteSingleHandler<TEntity>(
    IApplicationDbContext db,
    AutocompleteExpressionService expressionService,
    AutocompleteDisplayTransform<TEntity> displayTransform)
    : IRequestHandler<AutocompleteSingleQuery<TEntity>, Result<AutocompleteQueryResponse>>
    where TEntity : Entity
{
    public async Task<Result<AutocompleteQueryResponse>> Handle(
        AutocompleteSingleQuery<TEntity> request,
        CancellationToken cancellationToken)
    {
        var transormToResponse = expressionService.BuildResponseTransformExpression(displayTransform);

        var result = await db.Set<TEntity>()
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(transormToResponse)
            .SingleOrDefaultAsync(cancellationToken);

        if (result == null)
            return Error.NotFound(typeof(TEntity).Name);

        return result;
    }
}
