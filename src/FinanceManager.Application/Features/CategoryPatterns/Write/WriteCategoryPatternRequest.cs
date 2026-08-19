using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.CategoryPatterns.Write;

public sealed record WriteCategoryPatternRequest
{
    [Required]
    public required string Pattern { get; init; }
    public int? TransactionCategoryId { get; init; }
}
