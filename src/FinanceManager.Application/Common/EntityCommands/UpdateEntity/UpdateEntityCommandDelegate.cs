using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.UpdateEntity;

public delegate IRequest<Result> UpdateEntityCommandDelegate<TRequest>(TRequest request);
