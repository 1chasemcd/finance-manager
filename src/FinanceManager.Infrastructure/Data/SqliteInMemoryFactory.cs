using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using FinanceManager.Domain.TransactionCategories;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Infrastructure.Data;

internal static class SqliteInMemoryFactory
{
    public static SqliteConnection AddInMemoryDb(this IServiceCollection services)
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        services.AddSingleton(connection);

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            SqliteConnection sqliteConnection = sp.GetRequiredService<SqliteConnection>();
            options.UseSqlite(sqliteConnection);
        });

        return connection;
    }

    public static async Task SeedData(this SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        using var context = new ApplicationDbContext(options);
        await context.Database.EnsureCreatedAsync();

        TransactionCategory[] spendingCategories = [
            TransactionCategory.Create("Groceries", "Food and Home Goods"),
            TransactionCategory.Create("Travel", "Adventures in Faraway places"),
            TransactionCategory.Create("Automotive"),
            TransactionCategory.Create("Gifts"),
            TransactionCategory.Create("Healthcare"),
            TransactionCategory.Create("Transfers", "Moving funds between accounts"),
        ];
        await context.AddRangeAsync(spendingCategories);

        PersonalInfo[] personalInfos = [
            PersonalInfo.Create("Chase", "McDonald"),
            PersonalInfo.Create("Hannah", "McDonald"),
        ];

        await context.AddRangeAsync(personalInfos);
        await context.SaveChangesAsync();

        TransactionSource[] sources = [
            TransactionSource.CreateWithOwner("Chase Wells Fargo Credit", personalInfos[0]),
            TransactionSource.CreateWithOwner("Chase Fidelity Cash Management", personalInfos[0]),
            TransactionSource.CreateWithOwner("Hannah Discover Credit", personalInfos[1]),
            TransactionSource.CreateWithOwner("Hannah Fidelity Cash Management", personalInfos[1]),
            TransactionSource.CreateWithOwner("Hannah CB Credit", personalInfos[1]),
        ];

        await context.AddRangeAsync(sources);
        await context.SaveChangesAsync();


        FinancialTransaction[] transactions = [
            FinancialTransaction.Create(89.23m, RandomDate(), "KROGER PURCHASE", sources[0], spendingCategories[0]),
            FinancialTransaction.Create(305.80m, RandomDate(), "UNITED AIRLINES FLIGHT DEN -> LGA", sources[4], spendingCategories[1]),
            FinancialTransaction.Create(48.15m, RandomDate(), "MAVERICK GAS STATION", sources[2], spendingCategories[2]),
            FinancialTransaction.Create(68.54m, RandomDate(), "CITY MARKET PURCHASE", sources[4], spendingCategories[0]),
            FinancialTransaction.Create(523.90m, RandomDate(), "CREDIT CARD PAYMENT - THANK YOU", sources[0], spendingCategories[5]),
            FinancialTransaction.Create(156.13m, RandomDate(), "TRUE AUTOMOTIVE GLENWOOD", sources[0], spendingCategories[2]),
            FinancialTransaction.Create(209.13m, RandomDate(), "VALLEY VIEW HOSPITAL VISIT BILL", sources[0], spendingCategories[4]),
            FinancialTransaction.Create(29.97m, RandomDate(), "CITY MARKET PURCHASE", sources[2], spendingCategories[0]),
            FinancialTransaction.Create(200.00m, RandomDate(), "FIDELITY TRANSFER BETWEEN ACCOUNTS", sources[1], spendingCategories[5]),
            FinancialTransaction.Create(50.99m, RandomDate(), "AMAZON.COM PURCHASE", sources[0], spendingCategories[3]),
            FinancialTransaction.Create(122.50m, RandomDate(), "HILTON HOTELS", sources[4], spendingCategories[1]),
        ];

        await context.AddRangeAsync(transactions);
        await context.SaveChangesAsync();

    }

    private static DateTime RandomDate()
    {
        Random random = new();
        return new DateTime(2026, random.Next() % 12 + 1, random.Next() % 28 + 1);
    }
}
