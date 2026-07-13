using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;

namespace FinanceManager.Application.Common.EntityRequests.ListEntities;

internal sealed class ListEntitiesHandler<TRequest, TResponse, TEntity>(
    IApplicationDbContext db,
    IEntityQueryBuilder<TRequest, TEntity> queryBuilder,
    IExpressionMapper<TEntity, TResponse> mapper)
    : IRequestHandler<ListEntitiesQuery<TRequest, TResponse, TEntity>, Result<IReadOnlyList<TResponse>>>
    where TRequest : IFilterRequest<TEntity>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity

{
    public async Task<Result<IReadOnlyList<TResponse>>> Handle(ListEntitiesQuery<TRequest, TResponse, TEntity> command, CancellationToken cancellationToken)
    {
        var query = db.Set<TEntity>();
        var results = queryBuilder.BuildQuery(command.Request, query);
        return results.Skip(command.Request.Skip)
            .Take(command.Request.Take)
            .Select(mapper.Map).ToList();
    }
}
