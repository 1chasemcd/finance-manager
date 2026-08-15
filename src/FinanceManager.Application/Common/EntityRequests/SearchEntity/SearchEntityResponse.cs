using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Common.EntityRequests.SearchEntity;

public sealed record SearchEntityResponse<TResponse>
{
    public required IReadOnlyList<TResponse> Results { get; init; }
    [Required]
    public int Total { get; init; }
}
