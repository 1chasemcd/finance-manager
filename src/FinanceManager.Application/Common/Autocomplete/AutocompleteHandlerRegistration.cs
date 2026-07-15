using System.Linq.Expressions;
using FinanceManager.Application.Common.Autocomplete.Search;
using FinanceManager.Application.Common.Autocomplete.Single;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Application.Common.Autocomplete;

internal static class AutocompleteHandlerRegistration
{
    public static IServiceCollection AddAutocompleteHandler<TEntity>(
        this IServiceCollection services,
        Expression<Func<TEntity, string>> transformExpression)
        where TEntity : Entity
    {
        services.AddSingleton(new AutocompleteDisplayTransform<TEntity>(transformExpression));

        services.AddTransient<
            IRequestHandler<AutocompleteSearchQuery<TEntity, Unit>, Result<IReadOnlyList<AutocompleteQueryResponse>>>,
            AutocompleteSearchHandler<TEntity, Unit>
        >();
        services.AddTransient<
            IRequestHandler<AutocompleteSingleQuery<TEntity>, Result<AutocompleteQueryResponse>>,
            AutocompleteSingleHandler<TEntity>
        >();
        return services;
    }

    public static IServiceCollection AddAutocompleteHandlers<TEntity, TFilter>(
        this IServiceCollection services,
        Expression<Func<TEntity, string>> transformExpression)
        where TEntity : Entity
    {
        services.AddSingleton(new AutocompleteDisplayTransform<TEntity>(transformExpression));

        services.AddTransient<
            IRequestHandler<AutocompleteSearchQuery<TEntity, TFilter>, Result<IReadOnlyList<AutocompleteQueryResponse>>>,
            AutocompleteSearchHandler<TEntity, TFilter>
        >();
        services.AddTransient<
            IRequestHandler<AutocompleteSingleQuery<TEntity>, Result<AutocompleteQueryResponse>>,
            AutocompleteSingleHandler<TEntity>
        >();
        return services;
    }
}
