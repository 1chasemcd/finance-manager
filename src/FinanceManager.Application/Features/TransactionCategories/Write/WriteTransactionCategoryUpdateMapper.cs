using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionCategories;

namespace FinanceManager.Application.Features.TransactionCategories.Write;

internal sealed class UpdateTransactionCategoryRequestMapper : IUpdateMapper<WriteTransactionCategoryRequest, TransactionCategory>
{
    public void Map(WriteTransactionCategoryRequest source, TransactionCategory destination)
    {
        destination.Name = source.Name;
        destination.Description = source.Description;
    }
}
