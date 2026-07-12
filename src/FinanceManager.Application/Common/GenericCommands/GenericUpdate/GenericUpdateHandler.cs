using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.GenericUpdate;

public class GenericUpdateHandler<TRequest, TEntity>(
    IApplicationDbContext db,
    IMapper<TRequest, TEntity> mapper)
    : IRequestHandler<GenericUpdateCommand<TRequest, TEntity>, Result>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result> Handle(GenericUpdateCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity entity = mapper.Map(command.Request);

        TEntity? existing = await db.Set<TEntity>().FindAsync([entity.Id], cancellationToken);
        if (existing is null) return GenericCommandError.NotFound<TEntity>();

        db.Set<TEntity>().Update(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
