using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.TransactionSources;

namespace FinanceManager.Application.Features.TransactionSources.Query;

internal sealed record TransactionSourceResponseMapper : IExpressionMapper<TransactionSource, TransactionSourceResponse>
{
    public Expression<Func<TransactionSource, TransactionSourceResponse>> Map
        => x => new TransactionSourceResponse
        {
            Id = x.Id,
            Name = x.Name,
            OwnerId = x.OwnerId,
            OwnerName = x.Owner.FirstName + " " + x.Owner.LastName
        };
}
