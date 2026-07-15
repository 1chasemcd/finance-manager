using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.FinancialAccounts;

internal sealed record UpdateFinancialAccountRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; init; }
    [Required]
    public int OwnerId { get; init; }
}

