using FinanceManager.Domain.Common;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Domain.CategoryPatterns;

public sealed class CategoryPattern : Entity
{
    public required string Pattern { get; set; }
    public int? TransactionCategoryId { get; set; }
    public TransactionCategory? TransactionCategory { get; set; }
}
