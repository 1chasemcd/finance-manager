using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.FinancialTransactions;

namespace FinanceManager.Application.Features.FinancialTransactions;

internal sealed class FinancialTransactionFilterHandler : IEntityFilterHandler<FinancialTransaction, FinancialTransactionFilter>
{
    public IQueryable<FinancialTransaction> ApplyFilter(

        FinancialTransactionFilter filter,
        IQueryable<FinancialTransaction> query)
    {
        if (filter.MinDate != null)
            query = query.Where(x => x.Date > filter.MinDate);

        if (filter.MaxDate != null)
            query = query.Where(x => x.Date < filter.MaxDate);

        if (filter.MinAmount != null)
            query = query.Where(x => x.Amount > filter.MinAmount);

        if (filter.MaxAmount != null)
            query = query.Where(x => x.Amount < filter.MaxAmount);

        if (filter.FinancialAccountId != null)
            query = query.Where(x => x.FinancialAccountId == filter.FinancialAccountId);

        if (filter.SpendingCategoryId != null)
            query = query.Where(x => x.SpendingCategoryId == filter.SpendingCategoryId);

        return query;
    }
}
