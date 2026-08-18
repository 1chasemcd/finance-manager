using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common;
using FinanceManager.Application.Common.Autocomplete;
using FinanceManager.Application.Common.Behaviors;
using FinanceManager.Application.Common.EntityAssociations;
using FinanceManager.Application.Common.EntityRequests;
using FinanceManager.Application.Features.TransactionSources.Query;
using FinanceManager.Application.Features.TransactionSources.Write;
using FinanceManager.Application.Features.SpendingCategories.Write;
using FinanceManager.Application.Features.SpendingCategories.Query;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.SpendingCategories;
using FluentValidation;
using Microsoft.Extensions.Hosting;
using FinanceManager.Application.Features.FinancialTransactions.Query;
using FinanceManager.Domain.TransactionSources;

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

            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        builder.Services.AddValidatorsFromAssembly(assembly);

        builder.Services.AddSingleton<IEntityAssociationRegistry>(EntityAssociationRegistry.Instance);
        builder.Services.AddTransient<AutocompleteExpressionService>();

        builder.Services.AddAllImplementationsTransient(assembly, typeof(IMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IUpdateMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IExpressionMapper<,>));
        builder.Services.AddAllImplementationsTransient(assembly, typeof(IEntityFilterHandler<,>));

        builder.Services.AddCreateEntityHandler<SpendingCategory, WriteSpendingCategoryRequest>();
        builder.Services.AddUpdateEntityHandler<SpendingCategory, WriteSpendingCategoryRequest>();
        builder.Services.AddLookupEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddSearchEntityHandler<SpendingCategory, SpendingCategoryResponse>();
        builder.Services.AddDeleteEntityHandler<SpendingCategory>();
        builder.Services.AddAutocompleteHandler<SpendingCategory>(x => x.Name);

        builder.Services.AddCreateEntityHandler<TransactionSource, WriteTransactionSourceRequest>();
        builder.Services.AddUpdateEntityHandler<TransactionSource, WriteTransactionSourceRequest>();
        builder.Services.AddLookupEntityHandler<TransactionSource, TransactionSourceResponse>();
        builder.Services.AddSearchEntityHandler<TransactionSource, TransactionSourceResponse>();
        builder.Services.AddDeleteEntityHandler<TransactionSource>();
        builder.Services.AddAutocompleteHandler<TransactionSource>(x => x.Name);

        builder.Services.AddLookupEntityHandler<FinancialTransaction, FinancialTransactionResponse>();
        builder.Services.AddSearchEntityHandler<FinancialTransaction, FinancialTransactionResponse, FinancialTransactionFilter>();

        return builder;
    }
}
