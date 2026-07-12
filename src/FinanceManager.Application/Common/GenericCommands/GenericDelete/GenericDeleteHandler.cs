using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.GenericCommands.GenericDelete;

public class GenericDeleteHandler<TRequest, TEntity>(
    IApplicationDbContext db)
    : IRequestHandler<GenericDeleteCommand<TRequest, TEntity>, Result>
    where TRequest : IDeleteRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result> Handle(GenericDeleteCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? entity = await db.Set<TEntity>().FindAsync([command.Request.Id], cancellationToken);
        if (entity is null) return new NotFoundError(typeof(TEntity).Name);

        db.Set<TEntity>().Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
