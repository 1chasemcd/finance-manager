using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.CategoryPatterns.Query;

public sealed record CategoryPatternResponse
{
    [Required]
    public int Id { get; init; }
    [Required]
    public required string Pattern { get; init; }
    public int? TransactionCategoryId { get; init; }
    public string? TransactionCategoryName { get; init; }

}
