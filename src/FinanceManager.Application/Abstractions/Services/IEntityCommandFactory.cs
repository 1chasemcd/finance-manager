using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityCommandFactory
{
    Func<TRequest, IRequest<Result<int>>> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest;
    Func<TRequest, IRequest<Result>> BuildUpdateDelegate<TRequest>()
        where TRequest : IUpdateRequest;
    Func<TRequest, IRequest<Result>> BuildDeleteDelegate<TRequest>()
        where TRequest : IDeleteRequest;
}
