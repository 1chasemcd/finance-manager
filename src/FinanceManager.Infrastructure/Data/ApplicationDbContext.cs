using System.Reflection;
using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.SpendingCategories;
using FinanceManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>(options),
    IApplicationDbContext, IUnitOfWork
{
    public DbSet<SpendingCategory> SpendingCategories => Set<SpendingCategory>();
    public DbSet<PersonalInfo> PersonalInfos => Set<PersonalInfo>();
    public DbSet<FinancialTransaction> FinancialTransactions => Set<FinancialTransaction>();
    public DbSet<FinancialAccount> FinancialAccounts => Set<FinancialAccount>();
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public Task BeginTransactionAsync(CancellationToken cancellationToken) => Database.BeginTransactionAsync(cancellationToken);
    public Task CommitAsync(CancellationToken cancellationToken) => Database.CommitTransactionAsync(cancellationToken);
    public Task RollbackAsync(CancellationToken cancellationToken) => Database.RollbackTransactionAsync(cancellationToken);
}
