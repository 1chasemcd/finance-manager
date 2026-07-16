namespace FinanceManager.Application.Features.FinancialAccounts;

internal sealed record CreateFinancialAccountRequest
{
    public required string Name { get; init; }
    public int OwnerId { get; init; }
}
