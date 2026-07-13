using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Messages;

public interface IFilterRequest
{
    int Skip { get; init; }
    int Take { get; init; }
}
public interface IFilterRequest<TEntity> : IFilterRequest where TEntity : Entity;
