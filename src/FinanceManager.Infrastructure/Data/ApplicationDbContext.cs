using System.Reflection;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.Common;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.SpendingCategories;
using FinanceManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Infrastructure.Data;

internal class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>(options),
    IApplicationDbContext, IUnitOfWork
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        var entityTypes = typeof(Entity).Assembly
            .GetTypes()
            .Where(t =>
                t.IsClass &&
                !t.IsAbstract &&
                typeof(Entity).IsAssignableFrom(t));

        foreach (var type in entityTypes)
        {
            builder.Entity(type);
        }
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

    }

    public Task BeginTransactionAsync(CancellationToken cancellationToken) => Database.BeginTransactionAsync(cancellationToken);
    public Task CommitAsync(CancellationToken cancellationToken) => Database.CommitTransactionAsync(cancellationToken);
    public Task RollbackAsync(CancellationToken cancellationToken) => Database.RollbackTransactionAsync(cancellationToken);
}
