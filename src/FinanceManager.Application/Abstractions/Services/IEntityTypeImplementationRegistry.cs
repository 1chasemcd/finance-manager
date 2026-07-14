using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityTypeImplementationRegistry : IDisposable
{
    public Type GetCreateEntityRequest<TEntity>() where TEntity : Entity;
    public Type GetUpdateEntityRequest<TEntity>() where TEntity : Entity;
    public Type GetEntityResponse<TEntity>() where TEntity : Entity;
    public Type GetEntityFilter<TEntity>() where TEntity : Entity;
}
