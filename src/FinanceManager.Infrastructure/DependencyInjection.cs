using FinanceManager.Infrastructure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FinanceManager.Infrastructure.Data;
using FinanceManager.Application.Abstractions;
using System.Reflection;

#pragma warning disable IDE0130
namespace Microsoft.Extensions.DependencyInjection;
#pragma warning restore IDE0130

public static class DependencyInjection
{
    public static IHostApplicationBuilder AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var openapiMode = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";

        if (!openapiMode)
        {
            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddInMemoryDb()
                    .SeedData().Wait();
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

        return builder;
    }
}
