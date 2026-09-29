using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Application.Features.TransactionSources.Write;

internal sealed class WriteTransactionSourceUpdateMapper : IUpdateMapper<WriteTransactionSourceRequest, TransactionSource>
{
    public void Map(WriteTransactionSourceRequest source, TransactionSource destination)
    {
        destination.Name = source.Name;
        destination.OwnerId = source.OwnerId;
    }
}
