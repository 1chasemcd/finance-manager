using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionCategories;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.TransactionCategories.Write;

public sealed class CreateTransactionCategoryValidator
    : AbstractValidator<WriteTransactionCategoryRequest>
{
    private readonly IApplicationDbContext _db;
    public CreateTransactionCategoryValidator(IApplicationDbContext db)
    {
        _db = db;

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .MustAsync(NameIsUnique);
        RuleFor(x => x.Description)
            .MaximumLength(500);
    }

    private async Task<bool> NameIsUnique(string name, CancellationToken cancellationToken)
    {
        var any = await _db.Set<TransactionCategory>()
            .AnyAsync(x => x.Name == name, cancellationToken);
        return !any;
    }
}
