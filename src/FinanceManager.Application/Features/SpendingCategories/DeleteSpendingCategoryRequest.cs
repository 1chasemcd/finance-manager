using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Domain.SpendingCategories;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record DeleteSpendingCategoryRequest : IDeleteRequest<SpendingCategory>
{
    [Required]
    public int Id { get; init; }
}
