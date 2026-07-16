namespace FinanceManager.Application.Features.FinancialAccounts.Write;

public sealed record WriteFinancialAccountRequest
{
    public required string Name { get; init; }
    public int OwnerId { get; init; }
}
