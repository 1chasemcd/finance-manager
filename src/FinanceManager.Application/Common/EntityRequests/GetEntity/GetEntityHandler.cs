using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.EntityRequests.GetEntity;

internal sealed class GetEntityHandler<TResponse, TEntity>(
    IApplicationDbContext db,
    IExpressionMapper<TEntity, TResponse> mapper)
    : IRequestHandler<GetEntityQuery<TResponse, TEntity>, Result<TResponse>>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity

{
    public async Task<Result<TResponse>> Handle(GetEntityQuery<TResponse, TEntity> command, CancellationToken cancellationToken)
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
