using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.DeleteEntity;

public class DeleteEntityHandler<TRequest, TEntity>(
    IApplicationDbContext db)
    : IRequestHandler<DeleteEntityCommand<TRequest, TEntity>, Result>
    where TRequest : IDeleteRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result> Handle(DeleteEntityCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? entity = await db.Set<TEntity>().FindAsync([command.Request.Id], cancellationToken);
        if (entity is null) return Error.NotFound(typeof(TEntity).Name);

        db.Set<TEntity>().Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
