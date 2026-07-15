using System.Collections.Concurrent;
using FinanceManager.Application.Abstractions.Services;

namespace FinanceManager.Application.Common.EntityAssociations;

internal sealed class EntityAssociationRegistry : IEntityAssociationRegistry
{
    public static EntityAssociationRegistry Instance = new();
    private readonly ConcurrentDictionary<Type, IEntityAssociationRegistryFor> _lookups = [];
    public void Dispose()
    {
        _lookups.Clear();
    }
    IEntityAssociationRegistryFor IEntityAssociationRegistry.For<TEntity>()
    {
        return For<TEntity>();
    }

    internal EntityAssociationRegistryFor<TEntity> For<TEntity>()
    {
        return (EntityAssociationRegistryFor<TEntity>)_lookups
            .GetOrAdd(typeof(TEntity), new EntityAssociationRegistryFor<TEntity>());
    }
}
