using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.People.Query;

public sealed record PersonResponse
{
    [Required]
    public int Id { get; init; }
    [Required]
    public required string FirstName { get; init; }
    [Required]
    public required string LastName { get; init; }
}
