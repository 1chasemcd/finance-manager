using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityCommandFactory
{
    CreateEntityCommandDelegate<TRequest> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest;
    UpdateEntityCommandDelegate<TRequest> BuildUpdateDelegate<TRequest>()
    where TRequest : IUpdateRequest;
    DeleteEntityCommandDelegate BuildDeleteDelegate<TRequest>()
    where TRequest : IDeleteRequest;
}
