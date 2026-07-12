using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Common.EntityCommands.DeleteEntity;

public delegate IRequest<Result> DeleteEntityCommandDelegate(int id);
