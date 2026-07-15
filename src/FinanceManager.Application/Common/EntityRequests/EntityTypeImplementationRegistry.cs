using System.Collections.Concurrent;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Common.EntityRequests;

internal enum EntityTypeRegistryCategory
{
    CreateEntityRequest,
    UpdateEntityRequest,
    EntityResponse,
    EntityFilter
}
internal sealed class EntityTypeImplementationRegistry : IEntityTypeImplementationRegistry
{
    public static EntityTypeImplementationRegistry Instance = new();
    private readonly ConcurrentDictionary<Tuple<Type, EntityTypeRegistryCategory>, Type> _map = [];
    public void Dispose() => _map.Clear();
    public Type GetCreateEntityRequest<TEntity>() where TEntity : Entity
    {
        return _map[Key(typeof(TEntity), EntityTypeRegistryCategory.CreateEntityRequest)];
    }
    public Type GetUpdateEntityRequest<TEntity>() where TEntity : Entity
    {
        return _map[Key(typeof(TEntity), EntityTypeRegistryCategory.UpdateEntityRequest)];

    }
    public Type GetEntityResponse<TEntity>() where TEntity : Entity
    {
        return _map[Key(typeof(TEntity), EntityTypeRegistryCategory.EntityResponse)];

    }
    public Type GetEntityFilter<TEntity>() where TEntity : Entity
    {
        return _map[Key(typeof(TEntity), EntityTypeRegistryCategory.EntityFilter)];

    }

    internal void Add<TEntity, TType>(EntityTypeRegistryCategory category)
    {
        _map.AddOrUpdate(Key(typeof(TEntity), category), typeof(TType),
            (key, existing) =>
            {
                if (existing != typeof(TType))
                    throw new InvalidOperationException($"Already had a registration for {key}");
                return typeof(TType);
            });
    }

    private static Tuple<Type, EntityTypeRegistryCategory> Key(
        Type entityType, EntityTypeRegistryCategory category)
    {
        return new(entityType, category);
    }
}
