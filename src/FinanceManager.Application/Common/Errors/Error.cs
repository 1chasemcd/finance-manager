namespace FinanceManager.Application.Common.Errors;

public abstract record Error
{
    public static NotFoundError NotFound(string? message = null)
        => message is not null ? new(message) : new();
    public static ConflictError Conflict(string? message = null)
        => message is not null ? new(message) : new();
    public static ValidationError Validation(
        IEnumerable<FieldValidationError> fieldValidationErrors)
        => new(fieldValidationErrors);
}
