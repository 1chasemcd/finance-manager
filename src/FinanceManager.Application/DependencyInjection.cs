using System.Reflection;
using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Abstractions.Services;
using FinanceManager.Application.Common.EntityRequests;
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


        builder.Services.AddAllInterfaces(assembly, typeof(IMapper<,>));
        builder.Services.AddAllInterfaces(assembly, typeof(IUpdateMapper<,>));
        builder.Services.AddAllInterfaces(assembly, typeof(IEntityListFilterHandler<,>));


        builder.Services.AddEntityRequestHandlers(assembly);


        builder.Services.AddTransient<IEntityRequestFactory, EntityRequestFactory>();

        return builder;
    }

    private static IServiceCollection AddAllInterfaces(
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
