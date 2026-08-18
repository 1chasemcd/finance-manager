using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.Transactions.Query;

internal sealed record TransactionResponse
{
    [Required]
    public int Id { get; init; }
    [Required]
    public decimal Amount { get; init; }
    [Required]
    public DateTime Date { get; init; }
    [Required]
    public required string Summary { get; init; }
    [Required]
    public int TransactionSourceId { get; init; }
    [Required]
    public required string TransactionSourceName { get; init; }
    [Required]
    public int TransactionCategoryId { get; init; }
    [Required]
    public required string TransactionCategoryName { get; init; }

}
