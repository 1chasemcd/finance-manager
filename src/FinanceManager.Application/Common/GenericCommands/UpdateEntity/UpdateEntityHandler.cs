using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.UpdateEntity;

public class UpdateEntityHandler<TRequest, TEntity>(
    IApplicationDbContext db,
    IMapper<TRequest, TEntity> mapper)
    : IRequestHandler<UpdateEntityCommand<TRequest, TEntity>, Result>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result> Handle(UpdateEntityCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity entity = mapper.Map(command.Request);

        TEntity? existing = await db.Set<TEntity>().FindAsync([entity.Id], cancellationToken);
        if (existing is null) return Error.NotFound(typeof(TEntity).Name);

        db.Set<TEntity>().Update(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
