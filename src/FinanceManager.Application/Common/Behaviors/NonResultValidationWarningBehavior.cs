using FinanceManager.Application.Common.Results;
using FluentValidation;
using MediatR;

namespace FinanceManager.Application.Common.Behaviors;

public class NonResultValidationWarningBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public NonResultValidationWarningBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any() || typeof(TResponse).IsAssignableTo(typeof(Result)))
            return await next(cancellationToken);

        throw new InvalidOperationException($"Requests with validators must return a {typeof(Result).Name} response.");
    }
}
