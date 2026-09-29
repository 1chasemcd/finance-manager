namespace FinanceManager.Application.Features.TransactionSources.Write;

public sealed record WriteTransactionSourceRequest
{
    public required string Name { get; init; }
    public int OwnerId { get; init; }
}
