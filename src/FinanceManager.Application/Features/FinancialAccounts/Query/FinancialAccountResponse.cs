namespace FinanceManager.Application.Features.FinancialAccounts.Query;

internal sealed record FinancialAccountResponse
{
    public required string Name { get; init; }
    public int OwnerId { get; init; }
    public required string OwnerName { get; init; }
}
