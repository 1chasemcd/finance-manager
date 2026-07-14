using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using FinanceManager.Application.Abstractions.Services;

namespace FinanceManager.Application.Common.EntityRequests.CreateEntity;

internal sealed class CreateEntityHandler<TEntity, TRequest>(
    IApplicationDbContext db,
    IMapper<TRequest, TEntity> mapper)
    : IRequestHandler<CreateEntityCommand<TEntity, TRequest>, Result<int>>
    where TEntity : Entity
{
    public async Task<Result<int>> Handle(CreateEntityCommand<TEntity, TRequest> command, CancellationToken cancellationToken)
    {
        TEntity entity = mapper.Map(command.Request);
        db.Set<TEntity>().Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
