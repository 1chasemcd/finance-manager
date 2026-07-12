using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.StandardQueries;

public interface IGetEntityResponse;
public interface IGetEntityResponse<TEntity> : IGetEntityResponse
    where TEntity : Entity;


public sealed record GetEntityCommand<TResponse, TEntity> : IRequest<Result<TResponse>>
    where TResponse : IGetEntityResponse<TEntity>
    where TEntity : Entity
{
    public int Id { get; init; }
}

public class GetEntityRequestHandler<TResponse, TEntity>(
    IApplicationDbContext db,
    IMapper<TEntity, TResponse> mapper)
    : IRequestHandler<GetEntityCommand<TResponse, TEntity>, Result<TResponse>>
    where TResponse : IGetEntityResponse<TEntity>
    where TEntity : Entity

{
    public async Task<Result<TResponse>> Handle(GetEntityCommand<TResponse, TEntity> command, CancellationToken cancellationToken)
    {
        TEntity? entity = await db.Set<TEntity>().FindAsync([command.Id], cancellationToken);
        if (entity is null) return new NotFoundError(typeof(TEntity).Name);
        return mapper.Map(entity);
    }
}
