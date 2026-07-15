using FinanceManager.Domain.Common;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Domain.FinancialTransactions;

public sealed class FinancialTransaction : Entity
{
    public decimal Amount { get; private set; }
    public DateTimeOffset Date { get; private set; }
    public string Summary { get; private set; } = null!;
    public int FinancialAccountId { get; private set; }
    public FinancialAccount FinancialAccount { get; private set; } = null!;
    public int SpendingCategoryId { get; set; }
    public SpendingCategory SpendingCategory { get; private set; } = null!;

    private FinancialTransaction() { }

    public static FinancialTransaction Create(
        decimal amount,
        DateTimeOffset date,
        string summary,
        FinancialAccount financialAccount,
        SpendingCategory category)
    {
        ArgumentException.ThrowIfNullOrEmpty(summary);
        ArgumentNullException.ThrowIfNull(financialAccount);
        ArgumentNullException.ThrowIfNull(category);

        return new()
        {
            Amount = amount,
            Date = date,
            Summary = summary,
            FinancialAccountId = financialAccount.Id,
            FinancialAccount = financialAccount,
            SpendingCategoryId = category.Id,
            SpendingCategory = category
        };
    }
}
