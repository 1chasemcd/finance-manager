using System.Reflection;
using FinanceManager.Application.Common.EntityCommands.EntityCommand;
using Microsoft.Extensions.DependencyInjection;

public static class EntityCommandRegistrar
{
    public static void Register(IServiceCollection serviceCollection)
    {
        var assembly = typeof(IEntityCommandRequest<>).Assembly;
        var requests = assembly.GetTypes()
            .Where(x => x.IsClass)
            .Where(x => x.GetInterfaces().Any(
                x => x.IsGenericType
                && x.GetGenericTypeDefinition() == typeof(IEntityCommandRequest<>)));
    }
}
