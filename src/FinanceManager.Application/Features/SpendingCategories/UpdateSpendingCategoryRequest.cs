using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record UpdateSpendingCategoryRequest : IUpdateRequest<SpendingCategory>
{
    [Required]
    public int Id { get; init; }
    [Required]
    [MaxLength(100)]
    public required string Name { get; init; }
    [MaxLength(500)]
    public string? Description { get; init; }
}

