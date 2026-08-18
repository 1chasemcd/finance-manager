using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.People;
using FinanceManager.Domain.TransactionSources;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.TransactionSources.Write;

public sealed class WriteTransactionSourceValidator : AbstractValidator<WriteTransactionSourceRequest>
{
    private readonly IApplicationDbContext _db;
    public WriteTransactionSourceValidator(IApplicationDbContext db)
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
        var any = await _db.Set<TransactionSource>()
            .AnyAsync(x => x.Name == name, cancellationToken);
        return !any;
    }

    private async Task<bool> OwnerExists(int ownerId, CancellationToken cancellationToken)
    {
        var any = await _db.Set<Person>()
            .AnyAsync(x => x.Id == ownerId, cancellationToken);
        return any;
    }
}
