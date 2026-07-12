using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IDeleteRequest;
public interface IDeleteRequest<TEntity> : IDeleteRequest where TEntity : Entity;
