using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.Results;
using MediatR;

namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityRequestFactory
{
    Func<TRequest, IRequest<Result<int>>> BuildCreateDelegate<TRequest>()
        where TRequest : ICreateRequest;
    Func<TRequest, IRequest<Result>> BuildUpdateDelegate<TRequest>()
        where TRequest : IUpdateRequest;
    Func<TRequest, IRequest<Result>> BuildDeleteDelegate<TRequest>()
        where TRequest : IDeleteRequest;

    Func<int, IRequest<Result<TResponse>>> BuildGetDelegate<TResponse>()
        where TResponse : IGetResponse;

    Func<TRequest, IRequest<Result<IReadOnlyList<TResponse>>>> BuildListDelegate<TRequest, TResponse>()
        where TRequest : IFilterRequest
        where TResponse : IGetResponse;
}
