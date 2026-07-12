using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IUpdateRequest
{
    int Id { get; }
}
public interface IUpdateRequest<TEntity> : IUpdateRequest where TEntity : Entity;
