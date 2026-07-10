using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.SpendingCategories;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.Persistence;

public interface IApplicationDbContext
{
    DbSet<SpendingCategory> SpendingCategories { get; }
    DbSet<PersonalInfo> PersonalInfos { get; }
    DbSet<FinancialTransaction> FinancialTransactions { get; }
    DbSet<FinancialAccount> FinancialAccounts { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
