using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.ListEntities;
using FinanceManager.Application.Common.EntityRequests.LookupEntity;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.EntityRequests;

internal static class EntityRequestHandlerRegistration
{
    public static IServiceCollection AddCreateEntityHandler<TEntity, TRequest>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        serviceCollection.AddTransient<
            IRequestHandler<CreateEntityCommand<TEntity, TRequest>, Result<int>>,
            CreateEntityHandler<TEntity, TRequest>
        >();

        EntityTypeImplementationRegistry.Instance.Add<TEntity, TRequest>(EntityTypeRegistryCategory.CreateEntityRequest);
        return serviceCollection;
    }

    public static IServiceCollection AddUpdateEntityHandler<TEntity, TRequest>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        serviceCollection.AddTransient<
            IRequestHandler<UpdateEntityCommand<TEntity, TRequest>, Result>,
            UpdateEntityHandler<TEntity, TRequest>
        >();

        EntityTypeImplementationRegistry.Instance.Add<TEntity, TRequest>(EntityTypeRegistryCategory.UpdateEntityRequest);
        return serviceCollection;
    }

    public static IServiceCollection AddDeleteEntityHandler<TEntity>(this IServiceCollection serviceCollection)
    where TEntity : Entity
    {
        return serviceCollection.AddTransient<
            IRequestHandler<DeleteEntityCommand<TEntity>, Result>,
            DeleteEntityHandler<TEntity>
        >();
    }

    public static IServiceCollection AddLookupEntityHandler<TEntity, TResponse>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        return serviceCollection.AddTransient<
            IRequestHandler<LookupEntityQuery<TEntity, TResponse>, Result<TResponse>>,
            LookupEntityHandler<TEntity, TResponse>
        >();
    }

    public static IServiceCollection AddListEntitiesHandler<TEntity, TFilter, TResponse>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        return serviceCollection.AddTransient<
            IRequestHandler<ListEntitiesQuery<TEntity, TFilter, TResponse>, Result<IReadOnlyList<TResponse>>>,
            ListEntitiesHandler<TEntity, TFilter, TResponse>
        >();
    }
}
