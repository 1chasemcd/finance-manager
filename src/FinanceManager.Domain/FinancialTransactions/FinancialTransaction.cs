using FinanceManager.Domain.Common;
using FinanceManager.Domain.SpendingCategories;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Domain.FinancialTransactions;

public sealed class FinancialTransaction : Entity
{
    public decimal Amount { get; private set; }
    public DateTime Date { get; private set; }
    public string Summary { get; private set; } = null!;
    public int TransactionSourceId { get; private set; }
    public TransactionSource TransactionSource { get; private set; } = null!;
    public int SpendingCategoryId { get; set; }
    public SpendingCategory SpendingCategory { get; private set; } = null!;

    private FinancialTransaction() { }

    public static FinancialTransaction Create(
        decimal amount,
        DateTime date,
        string summary,
        TransactionSource financialAccount,
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
            TransactionSourceId = financialAccount.Id,
            TransactionSource = financialAccount,
            SpendingCategoryId = category.Id,
            SpendingCategory = category
        };
    }
}
