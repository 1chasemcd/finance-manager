using FluentValidation;

namespace FinanceManager.Application.Features.People.Write;

public sealed class WritePersonValidator
    : AbstractValidator<WritePersonRequest>
{
    public WritePersonValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100);
        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100);
    }
}
