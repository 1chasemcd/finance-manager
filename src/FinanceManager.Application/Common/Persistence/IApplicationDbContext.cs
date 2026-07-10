using FinanceManager.Domain.SpendingCategories;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Common.Persistence;

public interface IApplicationDbContext
{
    DbSet<SpendingCategory> SpendingCategories { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
