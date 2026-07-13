using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.EntityRequests.UpdateEntity;

public class UpdateEntityHandler<TRequest, TEntity>(
    IApplicationDbContext db,
    IUpdateMapper<TRequest, TEntity> mapper)
    : IRequestHandler<UpdateEntityCommand<TRequest, TEntity>, Result>
    where TRequest : IUpdateRequest<TEntity>
    where TEntity : Entity

{
    public async Task<Result> Handle(UpdateEntityCommand<TRequest, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? existing = await db.Set<TEntity>().FindAsync([command.Request.Id], cancellationToken);
        if (existing is null) return Error.NotFound(typeof(TEntity).Name);
        mapper.Map(command.Request, existing);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
