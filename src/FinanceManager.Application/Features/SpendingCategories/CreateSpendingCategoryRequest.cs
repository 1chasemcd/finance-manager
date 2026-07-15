using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories;

internal sealed record CreateSpendingCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; init; }
    [MaxLength(500)]
    public string? Description { get; init; }
}
