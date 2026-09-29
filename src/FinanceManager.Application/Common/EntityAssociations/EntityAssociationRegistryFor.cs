using System.Collections.Concurrent;
using FinanceManager.Application.Abstractions;

namespace FinanceManager.Application.Common.EntityAssociations;

internal sealed class EntityAssociationRegistryFor<TEntity> : IEntityAssociationRegistryFor
{
    private readonly ConcurrentDictionary<EntityAssociationFeature, Type> _map = [];
    public Type GetRequired(EntityAssociationFeature feature)
    {
        return _map.TryGetValue(feature, out var value)
            ? value
            : throw new InvalidOperationException($"No registration on entity '{typeof(TEntity).Name}' for required feature '{feature}'");
    }
    public Type? GetOptional(EntityAssociationFeature feature)
    {
        return _map.TryGetValue(feature, out var value) ? value : null;
    }

    internal void Add(EntityAssociationFeature feature, Type type)
    {
        _map.AddOrUpdate(feature, type, (key, existing) =>
        {
            if (type != existing)
                throw new InvalidOperationException($"""
                Duplicate entity association registration for type '{typeof(TEntity).Name}' and feature '{feature}'

                Existing: {existing}
                New:      {type}
                """);
            return existing;
        });
    }
}
