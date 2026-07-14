using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record UpdateSpendingCategoryRequest
{
    [MaxLength(500)]
    public string? Description { get; init; }
}

