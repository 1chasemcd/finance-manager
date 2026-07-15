using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAllImplementationsTransient(
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
