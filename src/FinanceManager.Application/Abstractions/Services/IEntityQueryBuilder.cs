using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Services;

internal interface IEntityQueryBuilder<TFilter, TEntity>
    where TFilter : IFilterRequest<TEntity>
    where TEntity : Entity
{
    IQueryable<TEntity> BuildQuery(TFilter filter, IQueryable<TEntity> query);
}
