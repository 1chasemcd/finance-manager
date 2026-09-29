using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<T> Set<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
