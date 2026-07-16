using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.SpendingCategories;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.SpendingCategories.Write;

public sealed class CreateSpendingCategoryValidator
    : AbstractValidator<WriteSpendingCategoryRequest>
{
    private readonly IApplicationDbContext _db;
    public CreateSpendingCategoryValidator(IApplicationDbContext db)
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
        var any = await _db.Set<SpendingCategory>()
            .AnyAsync(x => x.Name == name, cancellationToken);
        return !any;
    }
}
