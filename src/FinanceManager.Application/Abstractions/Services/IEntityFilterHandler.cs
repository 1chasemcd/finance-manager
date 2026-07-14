using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Services;

internal interface IEntityFilterHandler<TEntity, TFilter>
    where TEntity : Entity
{
    IQueryable<TEntity> ApplyFilter(TFilter filter, IQueryable<TEntity> query);
}
