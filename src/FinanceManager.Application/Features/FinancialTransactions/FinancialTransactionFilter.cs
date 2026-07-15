namespace FinanceManager.Application.Features.FinancialTransactions;

internal sealed record FinancialTransactionFilter
{
    public DateTimeOffset? MinDate { get; init; }
    public DateTimeOffset? MaxDate { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public int? FinancialAccountId { get; init; }
    public int? SpendingCategoryId { get; init; }
}
