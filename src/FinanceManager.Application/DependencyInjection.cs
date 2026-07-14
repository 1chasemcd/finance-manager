using System.Reflection;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityRequests;
using FinanceManager.Application.Features.SpendingCategories;
using FinanceManager.Domain.SpendingCategories;
using Microsoft.Extensions.Hosting;

#pragma warning disable IDE0130
namespace Microsoft.Extensions.DependencyInjection;
#pragma warning restore IDE0130

public static class DependencyInjection
{
    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        var assembly = Assembly.GetExecutingAssembly();

        builder.Services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
        });

        builder.Services.AddSingleton<IEntityTypeImplementationRegistry>(EntityTypeImplementationRegistry.Instance);

        builder.Services.AddAllImplementationsTransient(assembly, typeof(IMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IUpdateMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IExpressionMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IEntityFilterHandler<,>));

        builder.Services.AddCreateEntityHandler<SpendingCategory, CreateSpendingCategoryRequest>();
        builder.Services.AddUpdateEntityHandler<SpendingCategory, UpdateSpendingCategoryRequest>();
        builder.Services.AddDeleteEntityHandler<SpendingCategory>();
        builder.Services.AddLookupEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddListEntitiesHandler<SpendingCategory, SpendingCategoryFilter, SpendingCategoryResponse>();

        return builder;
    }

    private static IServiceCollection AddAllImplementationsTransient(
    this IServiceCollection services,
    Assembly assembly, Type mapperType)
    {
        IEnumerable<Type> mapperImplementations = assembly
            .GetTypes()
            .Where(t =>
                t.IsClass &&
                !t.IsAbstract &&
                t.GetInterfaces()
                 .Any(i =>
                     i.IsGenericType &&
                     i.GetGenericTypeDefinition() == mapperType));

        foreach (Type implementation in mapperImplementations)
        {
            IEnumerable<Type> mapperInterfaces = implementation.GetInterfaces()
                .Where(i =>
                    i.IsGenericType &&
                    i.GetGenericTypeDefinition() == mapperType);

            foreach (Type mapperInterface in mapperInterfaces)
            {
                services.AddTransient(
                    mapperInterface,
                    implementation);
            }
        }

        return services;
    }
}
