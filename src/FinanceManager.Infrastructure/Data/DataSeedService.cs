using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.FinancialTransactions;
using FinanceManager.Domain.PersonalInfos;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Infrastructure.Data;

internal sealed class DataSeedService(ApplicationDbContext context)
{
    public async Task SeedAsync()
    {
        await context.Database.EnsureCreatedAsync();

        SpendingCategory[] spendingCategories = [
            SpendingCategory.Create("Groceries", "Food and Home Goods"),
            SpendingCategory.Create("Travel", "Adventures in Faraway places"),
            SpendingCategory.Create("Automotive"),
            SpendingCategory.Create("Gifts"),
            SpendingCategory.Create("Healthcare"),
            SpendingCategory.Create("Transfers", "Moving funds between accounts"),
        ];
        await context.AddRangeAsync(spendingCategories);

        PersonalInfo[] personalInfos = [
            PersonalInfo.Create("Chase", "McDonald"),
            PersonalInfo.Create("Hannah", "McDonald"),
        ];

        await context.AddRangeAsync(personalInfos);
        await context.SaveChangesAsync();

        FinancialAccount[] accounts = [
            FinancialAccount.CreateWithOwner("Chase Wells Fargo Credit", personalInfos[0]),
            FinancialAccount.CreateWithOwner("Chase Fidelity Cash Management", personalInfos[0]),
            FinancialAccount.CreateWithOwner("Hannah Discover Credit", personalInfos[1]),
            FinancialAccount.CreateWithOwner("Hannah Fidelity Cash Management", personalInfos[1]),
            FinancialAccount.CreateWithOwner("Hannah CB Credit", personalInfos[1]),
        ];

        await context.AddRangeAsync(accounts);
        await context.SaveChangesAsync();


        FinancialTransaction[] transactions = [
            FinancialTransaction.Create(89.23m, RandomDate(), "KROGER PURCHASE", accounts[0], spendingCategories[0]),
            FinancialTransaction.Create(305.80m, RandomDate(), "UNITED AIRLINES FLIGHT DEN -> LGA", accounts[4], spendingCategories[1]),
            FinancialTransaction.Create(48.15m, RandomDate(), "MAVERICK GAS STATION", accounts[2], spendingCategories[2]),
            FinancialTransaction.Create(68.54m, RandomDate(), "CITY MARKET PURCHASE", accounts[4], spendingCategories[0]),
            FinancialTransaction.Create(523.90m, RandomDate(), "CREDIT CARD PAYMENT - THANK YOU", accounts[0], spendingCategories[5]),
            FinancialTransaction.Create(156.13m, RandomDate(), "TRUE AUTOMOTIVE GLENWOOD", accounts[0], spendingCategories[2]),
            FinancialTransaction.Create(209.13m, RandomDate(), "VALLEY VIEW HOSPITAL VISIT BILL", accounts[0], spendingCategories[4]),
            FinancialTransaction.Create(29.97m, RandomDate(), "CITY MARKET PURCHASE", accounts[2], spendingCategories[0]),
            FinancialTransaction.Create(200.00m, RandomDate(), "FIDELITY TRANSFER BETWEEN ACCOUNTS", accounts[1], spendingCategories[5]),
            FinancialTransaction.Create(50.99m, RandomDate(), "AMAZON.COM PURCHASE", accounts[0], spendingCategories[3]),
            FinancialTransaction.Create(122.50m, RandomDate(), "HILTON HOTELS", accounts[4], spendingCategories[1]),
        ];

        await context.AddRangeAsync(transactions);
        await context.SaveChangesAsync();

    }

    private static DateTimeOffset RandomDate()
    {
        Random random = new();
        return new DateTime(2026, random.Next() % 12 + 1, random.Next() % 28 + 1);
    }
}
