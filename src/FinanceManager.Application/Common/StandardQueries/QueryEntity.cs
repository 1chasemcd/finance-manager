using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.StandardQueries;

public sealed record GetEntitiesCommand<TEntity, TResponse> : IRequest<Result<IReadOnlyList<TResponse>>>
    where TEntity : Entity
{
    [Range(0, int.MaxValue)]
    public int Skip { get; init; }
    [Range(0, 50)]
    [DefaultValue(50)]
    public int? Take { get; init; }

}

public class GetEntitiesRequestHandler<TEntity, TResponse>(
    IApplicationDbContext db,
    IMapper<TEntity, TResponse> mapper)
    : IRequestHandler<GetEntitiesCommand<TEntity, TResponse>, Result<IReadOnlyList<TResponse>>>
    where TEntity : Entity

{
    public async Task<Result<IReadOnlyList<TResponse>>> Handle(GetEntitiesCommand<TEntity, TResponse> command, CancellationToken cancellationToken)
    {
        List<TEntity> entities = await db.Set<TEntity>()
            .Skip(command.Skip)
            .Take(command.Take ?? 50)
            .ToListAsync(cancellationToken);
        return entities.Select(mapper.Map).ToList().AsReadOnly();
    }
}
