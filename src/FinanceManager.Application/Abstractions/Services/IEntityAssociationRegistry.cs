using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityAssociationRegistry : IDisposable
{
    public IEntityAssociationRegistryFor For<TEntity>()
        where TEntity : Entity;
}
