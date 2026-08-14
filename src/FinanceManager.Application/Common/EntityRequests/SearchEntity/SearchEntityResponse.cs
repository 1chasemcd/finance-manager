namespace FinanceManager.Application.Common.EntityRequests.SearchEntity;

public sealed record SearchEntityResponse<TResponse>
{
    public required IReadOnlyList<TResponse> Results { get; init; }
    public int Total { get; init; }
}
