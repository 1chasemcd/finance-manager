namespace FinanceManager.Infrastructure.Data;

public class DataSeedService(ApplicationDbContext context)
{
    public async Task SeedAsync()
    {
        context.Database.EnsureCreated();
    }
}
