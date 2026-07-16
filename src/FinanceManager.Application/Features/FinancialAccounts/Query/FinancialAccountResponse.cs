namespace FinanceManager.Application.Features.FinancialAccounts.Query;

internal sealed record FinancialAccountResponse
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public int OwnerId { get; init; }
    public required string OwnerName { get; init; }
}
