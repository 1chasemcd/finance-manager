using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common;
using FinanceManager.Application.Common.Autocomplete;
using FinanceManager.Application.Common.EntityAssociations;
using FinanceManager.Application.Common.EntityRequests;
using FinanceManager.Application.Features.FinancialAccounts;
using FinanceManager.Application.Features.FinancialTransactions;
using FinanceManager.Application.Features.SpendingCategories;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
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
        builder.Services.AddTransient<AutocompleteExpressionService>();

        builder.Services.AddAllImplementationsTransient(assembly, typeof(IMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IUpdateMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IExpressionMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IEntityFilterHandler<,>));

        builder.Services.AddCreateEntityHandler<SpendingCategory, CreateSpendingCategoryRequest>();
        builder.Services.AddUpdateEntityHandler<SpendingCategory, UpdateSpendingCategoryRequest>();
        builder.Services.AddLookupEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddSearchEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddDeleteEntityHandler<SpendingCategory>();
        builder.Services.AddAutocompleteHandler<SpendingCategory>(x => x.Name);

        builder.Services.AddCreateEntityHandler<FinancialAccount, CreateFinancialAccountRequest>();
        builder.Services.AddUpdateEntityHandler<FinancialAccount, UpdateFinancialAccountRequest>();
        builder.Services.AddLookupEntityHandler<FinancialAccount, FinancialAccountResponse>();
        builder.Services.AddSearchEntityHandler<FinancialAccount, FinancialAccountResponse>();
        builder.Services.AddDeleteEntityHandler<FinancialAccount>();
        builder.Services.AddAutocompleteHandler<FinancialAccount>(x => x.Name);

        builder.Services.AddLookupEntityHandler<FinancialTransaction, FinancialTransactionResponse>();
        builder.Services.AddSearchEntityHandler<FinancialTransaction, FinancialTransactionResponse, FinancialTransactionFilter>();

        return builder;
    }
}
