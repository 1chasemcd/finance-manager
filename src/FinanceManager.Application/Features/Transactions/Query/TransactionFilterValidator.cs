using FluentValidation;

namespace FinanceManager.Application.Features.Transactions.Query;

public sealed class TransactionFilterValidator : AbstractValidator<TransactionFilter>
{
    public TransactionFilterValidator()
    {
        RuleFor(x => x.MaxDate)
            .GreaterThan(x => x.MinDate)
            .When(x => x != null);

        RuleFor(x => x.MaxAmount)
            .GreaterThan(x => x.MinAmount)
            .When(x => x != null);
    }
}
