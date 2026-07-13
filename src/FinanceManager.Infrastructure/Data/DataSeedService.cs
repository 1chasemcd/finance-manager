namespace FinanceManager.Infrastructure.Data;

internal sealed class DataSeedService(ApplicationDbContext context)
{
    public async Task SeedAsync()
    {
        context.Database.EnsureCreated();
    }
}
