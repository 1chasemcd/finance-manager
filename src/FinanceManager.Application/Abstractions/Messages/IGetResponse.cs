using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Messages;

public interface IGetResponse;
public interface IGetResponse<TEntity> : IGetResponse where TEntity : Entity;
