namespace FinanceManager.Application.Features.FinancialTransactions.Query;

internal sealed record FinancialTransactionResponse
{
    public int Id { get; init; }
    public decimal Amount { get; init; }
    public DateTimeOffset Date { get; init; }
    public required string Summary { get; init; }
    public int FinancialAccountId { get; init; }
    public required string FinancialAccountName { get; init; }
    public int SpendingCategoryId { get; init; }
    public required string SpendingCategoryName { get; init; }

}
