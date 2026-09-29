using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.TransactionSources.Query;

internal sealed record TransactionSourceResponse
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
