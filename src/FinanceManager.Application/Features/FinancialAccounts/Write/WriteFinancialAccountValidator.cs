using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.PersonalInfos;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.FinancialAccounts.Write;

public sealed class WriteFinancialAccountValidator : AbstractValidator<WriteFinancialAccountRequest>
{
    private readonly IApplicationDbContext _db;
    public WriteFinancialAccountValidator(IApplicationDbContext db)
    {
        _db = db;

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .MustAsync(NameIsUnique);
        RuleFor(x => x.OwnerId)
            .NotNull()
            .MustAsync(OwnerExists);
    }

    private async Task<bool> NameIsUnique(string name, CancellationToken cancellationToken)
    {
        var any = await _db.Set<FinancialAccount>()
            .AnyAsync(x => x.Name == name, cancellationToken);
        return !any;
    }

    private async Task<bool> OwnerExists(int ownerId, CancellationToken cancellationToken)
    {
        var any = await _db.Set<PersonalInfo>()
            .AnyAsync(x => x.Id == ownerId, cancellationToken);
        return any;
    }
}
