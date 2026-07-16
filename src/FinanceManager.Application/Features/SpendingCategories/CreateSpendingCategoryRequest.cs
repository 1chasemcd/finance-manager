namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record CreateSpendingCategoryRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
