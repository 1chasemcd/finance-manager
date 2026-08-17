using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.FinancialTransactions.Query;

internal sealed record FinancialTransactionResponse
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
    public int FinancialAccountId { get; init; }
    [Required]
    public required string FinancialAccountName { get; init; }
    [Required]
    public int SpendingCategoryId { get; init; }
    [Required]
    public required string SpendingCategoryName { get; init; }

}
