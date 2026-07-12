using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IDeleteRequest
{
    int Id { get; init; }
};
public interface IDeleteRequest<TEntity> : IDeleteRequest where TEntity : Entity;
