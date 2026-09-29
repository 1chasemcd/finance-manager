namespace FinanceManager.Application.Features.TransactionCategories.Write;

public sealed record WriteTransactionCategoryRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
