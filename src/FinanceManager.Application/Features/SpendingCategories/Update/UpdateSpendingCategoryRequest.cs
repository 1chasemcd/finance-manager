namespace FinanceManager.Application.Features.SpendingCategories.Update;

public sealed record UpdateSpendingCategoryRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
