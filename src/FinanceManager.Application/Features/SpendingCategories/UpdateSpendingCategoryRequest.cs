using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record UpdateSpendingCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; init; }
    [MaxLength(500)]
    public string? Description { get; init; }
}

