using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityQueries.GetEntity;

public delegate IRequest<Result<TResponse>> GetEntityQueryDelegate<TResponse>(int id);
