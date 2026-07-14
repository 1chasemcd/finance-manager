using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record SpendingCategoryFilter
{
    [DefaultValue(0)]
    public int Skip { get; init; }
    [DefaultValue(50)]
    [Range(1, 50)]
    public int Take { get; init; } = 50;
    public string? NameContains { get; init; }
}
