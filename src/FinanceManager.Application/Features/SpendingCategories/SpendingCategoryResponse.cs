namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed record SpendingCategoryResponse
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }

}
