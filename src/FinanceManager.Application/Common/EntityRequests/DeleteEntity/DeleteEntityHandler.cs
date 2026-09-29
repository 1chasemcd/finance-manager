using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.DeleteEntity;

internal sealed class DeleteEntityHandler<TEntity>(
    IApplicationDbContext db)
    : IRequestHandler<DeleteEntityCommand<TEntity>, Result>
    where TEntity : Entity

{
    public async Task<Result> Handle(DeleteEntityCommand<TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? entity = await db.Set<TEntity>().FindAsync([command.Id], cancellationToken);
        if (entity is null) return Error.NotFound();

        db.Set<TEntity>().Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
