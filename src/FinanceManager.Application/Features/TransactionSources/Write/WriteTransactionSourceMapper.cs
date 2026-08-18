using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Application.Features.TransactionSources.Write;

internal sealed class WriteTransactionSourceMapper : IMapper<WriteTransactionSourceRequest, TransactionSource>
{
    public TransactionSource Map(WriteTransactionSourceRequest source) =>
        TransactionSource.CreateWithOwnerId(source.Name, source.OwnerId);
}
