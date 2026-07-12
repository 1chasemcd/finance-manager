using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IListRequest
{
    int Skip { get; init; }
    int? Take { get; init; }
}
public interface IListRequest<TEntity> : IListRequest where TEntity : Entity;
