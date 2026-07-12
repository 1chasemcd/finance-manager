using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityQueries.GetEntity;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityQueryFactory
{
    public GetEntityQueryDelegate<TResponse> BuildGetEntityQueryDelegate<TResponse>()
        where TResponse : IGetResponse;
}
