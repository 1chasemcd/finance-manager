using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record SpendingCategoryFilter
{
    public string? NameContains { get; init; }
}
