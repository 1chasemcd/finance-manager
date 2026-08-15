using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories.Query;

public sealed record SpendingCategoryResponse
{

    [Required]
    public int Id { get; init; }
    [Required]
    public required string Name { get; init; }
    public string? Description { get; init; }

}
