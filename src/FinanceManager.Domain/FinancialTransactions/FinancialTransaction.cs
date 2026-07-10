using FinanceManager.Domain.Common;
using FinanceManager.Domain.FinancialAccounts;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Domain.FinancialTransactions;

public sealed class FinancialTransaction : Entity
{
    public decimal Amount { get; set; }
    public DateTimeOffset Date { get; set; }
    public string Summary { get; set; } = null!;
    public int FinancialAccountId { get; set; }
    public FinancialAccount FinancialAccount { get; set; } = null!;
    public int SpendingCategoryId { get; set; }
    public SpendingCategory SpendingCategory { get; set; } = null!;
}
