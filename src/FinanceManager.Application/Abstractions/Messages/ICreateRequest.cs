using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Messages;

public interface ICreateRequest;
public interface ICreateRequest<TEntity> : ICreateRequest where TEntity : Entity;
