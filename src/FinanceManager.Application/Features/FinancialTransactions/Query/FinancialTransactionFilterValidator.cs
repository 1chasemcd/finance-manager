using FluentValidation;

namespace FinanceManager.Application.Features.FinancialTransactions.Query;

public sealed class FinancialTransactionFilterValidator : AbstractValidator<FinancialTransactionFilter>
{
    public FinancialTransactionFilterValidator()
    {
        RuleFor(x => x.MaxDate)
            .GreaterThan(x => x.MinDate)
            .When(x => x != null);

        RuleFor(x => x.MaxAmount)
            .GreaterThan(x => x.MinAmount)
            .When(x => x != null);
    }
}
