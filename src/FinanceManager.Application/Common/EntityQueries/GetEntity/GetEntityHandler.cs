using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityQueries.GetEntity;

public class GetEntityHandler<TResponse, TEntity>(
    IApplicationDbContext db,
    IMapper<TEntity, TResponse> mapper)
    : IRequestHandler<GetEntityQuery<TResponse, TEntity>, Result<TResponse>>
    where TResponse : IGetResponse<TEntity>
    where TEntity : Entity

{
    public async Task<Result<TResponse>> Handle(GetEntityQuery<TResponse, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? entity = await db.Set<TEntity>().FindAsync([command.Id], cancellationToken);
        if (entity is null) return Error.NotFound(typeof(TEntity).Name);
        return mapper.Map(entity);
    }
}
