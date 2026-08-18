using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common;
using FinanceManager.Application.Common.Autocomplete;
using FinanceManager.Application.Common.Behaviors;
using FinanceManager.Application.Common.EntityAssociations;
using FinanceManager.Application.Common.EntityRequests;
using FinanceManager.Application.Features.TransactionSources.Query;
using FinanceManager.Application.Features.TransactionSources.Write;
using FinanceManager.Application.Features.TransactionCategories.Write;
using FinanceManager.Application.Features.TransactionCategories.Query;
using FinanceManager.Domain.Transactions;
using FinanceManager.Domain.TransactionCategories;
using FluentValidation;
using Microsoft.Extensions.Hosting;
using FinanceManager.Application.Features.Transactions.Query;
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

        builder.Services.AddCreateEntityHandler<TransactionCategory, WriteTransactionCategoryRequest>();
        builder.Services.AddUpdateEntityHandler<TransactionCategory, WriteTransactionCategoryRequest>();
        builder.Services.AddLookupEntityHandler<TransactionCategory, TransactionCategoryResponse>();
        builder.Services.AddSearchEntityHandler<TransactionCategory, TransactionCategoryResponse>();
        builder.Services.AddDeleteEntityHandler<TransactionCategory>();
        builder.Services.AddAutocompleteHandler<TransactionCategory>(x => x.Name);

        builder.Services.AddCreateEntityHandler<TransactionSource, WriteTransactionSourceRequest>();
        builder.Services.AddUpdateEntityHandler<TransactionSource, WriteTransactionSourceRequest>();
        builder.Services.AddLookupEntityHandler<TransactionSource, TransactionSourceResponse>();
        builder.Services.AddSearchEntityHandler<TransactionSource, TransactionSourceResponse>();
        builder.Services.AddDeleteEntityHandler<TransactionSource>();
        builder.Services.AddAutocompleteHandler<TransactionSource>(x => x.Name);

        builder.Services.AddLookupEntityHandler<Transaction, TransactionResponse>();
        builder.Services.AddSearchEntityHandler<Transaction, TransactionResponse, TransactionFilter>();

        return builder;
    }
}
