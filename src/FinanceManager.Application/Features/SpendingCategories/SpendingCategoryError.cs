using FinanceManager.Application.Common.Errors;
using FinanceManager.Domain.SpendingCategories;

internal static class SpendingCategoryError
{
    public static Error NotFound => new NotFoundError(nameof(SpendingCategory));
}
