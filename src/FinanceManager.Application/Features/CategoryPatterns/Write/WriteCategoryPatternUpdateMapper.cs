using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.CategoryPatterns;

namespace FinanceManager.Application.Features.CategoryPatterns.Write;

internal sealed class WriteCategoryPatternRequestMapper : IUpdateMapper<WriteCategoryPatternRequest, CategoryPattern>
{
    public void Map(WriteCategoryPatternRequest source, CategoryPattern destination)
    {
        destination.Pattern = source.Pattern;
        destination.TransactionCategoryId = source.TransactionCategoryId;
    }
}
