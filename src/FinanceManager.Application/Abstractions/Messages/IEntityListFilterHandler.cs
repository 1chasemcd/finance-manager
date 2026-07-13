using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Messages;

public interface IEntityListFilterHandler<TRequest, TEntity>
    where TRequest : IListRequest<TEntity>
    where TEntity : Entity
{
    IQueryable<TEntity> ApplyFilter(TRequest filter, IQueryable<TEntity> query);
}
