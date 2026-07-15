using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common;
using FinanceManager.Application.Common.EntityAssociations;
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

        builder.Services.AddSingleton<IEntityAssociationRegistry>(EntityAssociationRegistry.Instance);

        builder.Services.AddAllImplementationsTransient(assembly, typeof(IMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IUpdateMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IExpressionMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IEntityFilterHandler<,>));

        builder.Services.AddCreateEntityHandler<SpendingCategory, CreateSpendingCategoryRequest>();
        builder.Services.AddUpdateEntityHandler<SpendingCategory, UpdateSpendingCategoryRequest>();
        builder.Services.AddDeleteEntityHandler<SpendingCategory>();
        builder.Services.AddLookupEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddSearchEntityHandler<SpendingCategory, SpendingCategoryResponse>();

        return builder;
    }
}
