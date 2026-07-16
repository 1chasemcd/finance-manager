namespace FinanceManager.Application.Features.SpendingCategories.Write;

public sealed record WriteSpendingCategoryRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
