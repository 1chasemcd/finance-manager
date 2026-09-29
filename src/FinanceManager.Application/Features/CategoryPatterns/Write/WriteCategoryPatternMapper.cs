using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.CategoryPatterns;

namespace FinanceManager.Application.Features.CategoryPatterns.Write;

internal sealed class WriteCategoryPatternMapper : IMapper<WriteCategoryPatternRequest, CategoryPattern>
{
    public CategoryPattern Map(WriteCategoryPatternRequest source)
        => new()
        {
            Pattern = source.Pattern,
            TransactionCategoryId = source.TransactionCategoryId
        };
}
