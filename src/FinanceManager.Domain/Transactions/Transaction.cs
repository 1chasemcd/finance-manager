using FinanceManager.Domain.Common;
using FinanceManager.Domain.TransactionCategories;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Domain.Transactions;

public sealed class Transaction : Entity
{
    public decimal Amount { get; private set; }
    public DateTime Date { get; private set; }
    public string Summary { get; private set; } = null!;
    public int TransactionSourceId { get; private set; }
    public TransactionSource TransactionSource { get; private set; } = null!;
    public int TransactionCategoryId { get; set; }
    public TransactionCategory TransactionCategory { get; private set; } = null!;

    private Transaction() { }

    public static Transaction Create(
        decimal amount,
        DateTime date,
        string summary,
        TransactionSource transactionSource,
        TransactionCategory category)
    {
        ArgumentException.ThrowIfNullOrEmpty(summary);
        ArgumentNullException.ThrowIfNull(transactionSource);
        ArgumentNullException.ThrowIfNull(category);

        return new()
        {
            Amount = amount,
            Date = date,
            Summary = summary,
            TransactionSourceId = transactionSource.Id,
            TransactionSource = transactionSource,
            TransactionCategoryId = category.Id,
            TransactionCategory = category
        };
    }
}
