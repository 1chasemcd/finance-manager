using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.CreateEntity;

public delegate IRequest<Result<int>> CreateEntityCommandDelegate<TRequest>(TRequest request);
