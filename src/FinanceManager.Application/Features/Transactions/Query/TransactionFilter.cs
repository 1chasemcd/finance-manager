namespace FinanceManager.Application.Features.Transactions.Query;

public sealed record TransactionFilter
{
    public DateTime? MinDate { get; init; }
    public DateTime? MaxDate { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public int? TransactionSourceId { get; init; }
    public int? TransactionCategoryId { get; init; }
}
