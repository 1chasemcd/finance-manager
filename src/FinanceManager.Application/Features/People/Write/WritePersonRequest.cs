using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.People.Write;

public sealed record WritePersonRequest
{
    [Required]
    public required string FirstName { get; init; }
    [Required]
    public required string LastName { get; init; }
}
