using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Application.Features.TransactionCategories.Write;

internal sealed class WriteTransactionCategoryMapper : IMapper<WriteTransactionCategoryRequest, TransactionCategory>
{
    public TransactionCategory Map(WriteTransactionCategoryRequest source)
        => TransactionCategory.Create(source.Name, source.Description);
}
