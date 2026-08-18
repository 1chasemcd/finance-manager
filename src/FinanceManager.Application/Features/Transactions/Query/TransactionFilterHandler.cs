using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.Transactions;

namespace FinanceManager.Application.Features.Transactions.Query;

internal sealed class TransactionFilterHandler : IEntityFilterHandler<Transaction, TransactionFilter>
{
    public IQueryable<Transaction> ApplyFilter(

        TransactionFilter filter,
        IQueryable<Transaction> query)
    {
        if (filter.MinDate != null)
            query = query.Where(x => x.Date > filter.MinDate);

        if (filter.MaxDate != null)
            query = query.Where(x => x.Date < filter.MaxDate);

        if (filter.MinAmount != null)
            query = query.Where(x => x.Amount > filter.MinAmount);

        if (filter.MaxAmount != null)
            query = query.Where(x => x.Amount < filter.MaxAmount);

        if (filter.TransactionSourceId != null)
            query = query.Where(x => x.TransactionSourceId == filter.TransactionSourceId);

        if (filter.TransactionCategoryId != null)
            query = query.Where(x => x.TransactionCategoryId == filter.TransactionCategoryId);

        return query;
    }
}
