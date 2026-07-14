using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.EntityRequests.LookupEntity;

internal sealed class LookupEntityHandler<TEntity, TResponse>(
    IApplicationDbContext db,
    IExpressionMapper<TEntity, TResponse> mapper)
    : IRequestHandler<LookupEntityQuery<TEntity, TResponse>, Result<TResponse>>
    where TEntity : Entity
{
    public async Task<Result<TResponse>> Handle(LookupEntityQuery<TEntity, TResponse> command, CancellationToken cancellationToken)
    {
        var response = await db.Set<TEntity>()
            .Where(e => e.Id == command.Id)
            .Select(mapper.Map)
            .SingleOrDefaultAsync(cancellationToken);

        if (response is null)
            return Error.NotFound(typeof(TEntity).Name);

        return response;
    }
}
