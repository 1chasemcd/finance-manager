using System.Reflection;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityCommands;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityQueries;
using FinanceManager.Application.Common.Mapping;
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


        builder.Services.AddMappers(assembly, typeof(IMapper<,>));
        builder.Services.AddMappers(assembly, typeof(IUpdateMapper<,>));

        builder.Services.AddEntityCommandHandlers(assembly);
        builder.Services.AddEntityQueryHandlers(assembly);


        builder.Services
            .AddTransient<IEntityCommandFactory, EntityCommandFactory>()
            .AddTransient<IEntityQueryFactory, EntityQueryFactory>();

        return builder;
    }

    private static IServiceCollection AddMappers(
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
