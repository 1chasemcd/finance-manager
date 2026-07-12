using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.SpendingCategories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace FinanceManager.Application.Abstractions.Persistence;

public interface IApplicationDbContext
{
    DbSet<T> Set<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
