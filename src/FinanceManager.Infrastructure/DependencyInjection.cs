using FinanceManager.Infrastructure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FinanceManager.Infrastructure.Data;
using FinanceManager.Application.Abstractions;

#pragma warning disable IDE0130
namespace Microsoft.Extensions.DependencyInjection;
#pragma warning restore IDE0130

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            builder.Services.AddScoped<DataSeedService>();
            builder.Services.AddInMemoryDb();
        }
        else
        {
            string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Missing required configuration: ConnectionStrings:DefaultConnection");

            builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
            {
                options.UseSqlite(connectionString);
            });
        }


        builder.Services
            .AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>())
            .AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());

        builder.Services.AddAuthentication();

        builder.Services
            .AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        builder.Services.AddSingleton(TimeProvider.System);
    }

    public static async Task SeedDataAsync(this IServiceProvider services)
    {
        using IServiceScope scope = services.CreateScope();
        DataSeedService seedService = scope.ServiceProvider.GetRequiredService<DataSeedService>();
        await seedService.SeedAsync();
    }
}
