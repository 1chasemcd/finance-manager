using FinanceManager.Domain.Common;
using FluentValidation;

namespace FinanceManager.Application.Common.Autocomplete.Search;

public sealed class AutocompleteSearchValidator<TEntity, TFilter>
    : AbstractValidator<AutocompleteSearchQuery<TEntity, TFilter>>
    where TEntity : Entity
{
    public AutocompleteSearchValidator(IValidator<TFilter>? filterValidator = null)
    {
        RuleFor(x => x.Skip)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Take)
            .InclusiveBetween(1, 50);

        if (filterValidator == null)
            return;
        RuleFor(x => x.Filter!)
            .SetValidator(filterValidator)
            .When(x => x != null);
    }
}
