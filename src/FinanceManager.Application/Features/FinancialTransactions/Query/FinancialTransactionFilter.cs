namespace FinanceManager.Application.Features.FinancialTransactions.Query;

public sealed record FinancialTransactionFilter
{
    public DateTime? MinDate { get; init; }
    public DateTime? MaxDate { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public int? TransactionSourceId { get; init; }
    public int? SpendingCategoryId { get; init; }
}
