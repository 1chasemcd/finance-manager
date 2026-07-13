using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.CreateEntity;

public class CreateEntityHandler<TRequest, TEntity>(
    IApplicationDbContext db,
    IMapper<TRequest, TEntity> mapper)
    : IRequestHandler<CreateEntityCommand<TRequest, TEntity>, Result<int>>
    where TRequest : ICreateRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result<int>> Handle(CreateEntityCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity entity = mapper.Map(command.Request);
        db.Set<TEntity>().Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
