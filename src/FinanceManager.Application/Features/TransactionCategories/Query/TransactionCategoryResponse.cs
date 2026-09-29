using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.TransactionCategories.Query;

public sealed record TransactionCategoryResponse
{

    [Required]
    public int Id { get; init; }
    [Required]
    public required string Name { get; init; }
    public string? Description { get; init; }

}
