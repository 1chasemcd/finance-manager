using FinanceManager.Application.Abstractions;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Domain.CategoryPatterns;
using FinanceManager.Domain.TransactionCategories;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.CategoryPatterns.Write;

public sealed class WriteCategoryPatternValidator
    : AbstractValidator<WriteCategoryPatternRequest>
{
    private readonly IApplicationDbContext _db;
    public WriteCategoryPatternValidator(IApplicationDbContext db)
    {
        _db = db;

        RuleFor(x => x.Pattern)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Pattern)
            .MustAsync(PatternIsUnique)
            .WithErrorCode(ErrorCodes.CONFLICT)
            .WithMessage("Pattern must be unique.");

        RuleFor(x => x.TransactionCategoryId)
            .MustAsync(TransactionCategoryExistsIfSet);
    }

    private async Task<bool> PatternIsUnique(string pattern, CancellationToken cancellationToken)
    {
        var any = await _db.Set<CategoryPattern>()
            .AnyAsync(x => x.Pattern == pattern, cancellationToken);
        return !any;
    }

    private async Task<bool> TransactionCategoryExistsIfSet(int? categoryId, CancellationToken cancellationToken)
    {
        if (categoryId is null || categoryId == 0) return true;
        var any = await _db.Set<TransactionCategory>()
            .AnyAsync(x => x.Id == categoryId, cancellationToken);
        return any;
    }
}
