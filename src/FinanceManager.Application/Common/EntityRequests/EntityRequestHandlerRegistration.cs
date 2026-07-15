using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.LookupEntity;
using FinanceManager.Application.Common.EntityRequests.SearchEntity;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Application.Common.EntityAssociations;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using FinanceManager.Application.Abstractions;

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

        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntityCreateRequest, typeof(TRequest));
        return serviceCollection;
    }

    public static IServiceCollection AddUpdateEntityHandler<TEntity, TRequest>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        serviceCollection.AddTransient<
            IRequestHandler<UpdateEntityCommand<TEntity, TRequest>, Result>,
            UpdateEntityHandler<TEntity, TRequest>
        >();

        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntityUpdateRequest, typeof(TRequest));
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
        serviceCollection.AddTransient<
            IRequestHandler<LookupEntityQuery<TEntity, TResponse>, Result<TResponse>>,
            LookupEntityHandler<TEntity, TResponse>
        >();

        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntityLookupResponse, typeof(TResponse));
        return serviceCollection;
    }

    public static IServiceCollection AddSearchEntityHandler<TEntity, TResponse, TFilter>(this IServiceCollection serviceCollection)
        where TEntity : Entity
    {
        serviceCollection.AddTransient<
            IRequestHandler<SearchEntityQuery<TEntity, TResponse, TFilter>, Result<IReadOnlyList<TResponse>>>,
            SearchEntityHandler<TEntity, TResponse, TFilter>
        >();

        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntitySearchFilter, typeof(TFilter));
        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntitySearchResponse, typeof(TResponse));

        return serviceCollection;
    }

    public static IServiceCollection AddSearchEntityHandler<TEntity, TResponse>(this IServiceCollection serviceCollection)
    where TEntity : Entity
    {
        serviceCollection.AddTransient<
            IRequestHandler<SearchEntityQuery<TEntity, TResponse, Unit>, Result<IReadOnlyList<TResponse>>>,
            SearchEntityHandler<TEntity, TResponse, Unit>
        >();

        EntityAssociationRegistry.Instance.For<TEntity>().Add(EntityAssociationFeature.EntitySearchResponse, typeof(TResponse));

        return serviceCollection;
    }
}
