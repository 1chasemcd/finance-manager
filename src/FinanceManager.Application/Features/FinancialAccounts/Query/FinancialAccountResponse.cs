using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.FinancialAccounts.Query;

internal sealed record FinancialAccountResponse
{
    [Required]
    public int Id { get; init; }
    [Required]
    public required string Name { get; init; }
    [Required]
    public int OwnerId { get; init; }
    [Required]
    public required string OwnerName { get; init; }
}
