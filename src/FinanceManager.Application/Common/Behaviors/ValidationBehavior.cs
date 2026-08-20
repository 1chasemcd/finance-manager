using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;
using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace FinanceManager.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    where TResponse : IResult<TResponse>
{

    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next(cancellationToken);
        }
        var context = new ValidationContext<TRequest>(request);

        var results = await Task.WhenAll(
            _validators.Select(v =>
                v.ValidateAsync(context, cancellationToken)));

        var failures = results
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        Error? error = null;
        if (failures.Where(IsValidationFailure) is var validationFailures && validationFailures.Any())
            error = Error.Validation(
                validationFailures.Select(x => new FieldValidationError(x.PropertyName, x.ErrorMessage)));
        else if (failures.Where(x => x.ErrorCode == ErrorCodes.CONFLICT) is var conflicts && conflicts.Any())
            error = Error.Conflict(conflicts.First().ErrorMessage);
        else if (failures.Where(x => x.ErrorCode == ErrorCodes.NOT_FOUND) is var notFounds && notFounds.Any())
            error = Error.NotFound(notFounds.First().ErrorMessage);

        if (error is not null)
            return TResponse.CreateErrorResult(error);

        return await next(cancellationToken);
    }

    private static bool IsValidationFailure(ValidationFailure failure)
    {
        return !new[] { ErrorCodes.CONFLICT, ErrorCodes.NOT_FOUND }.Contains(failure.ErrorCode);
    }
}
