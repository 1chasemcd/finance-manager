namespace FinanceManager.Application.Common.Errors;

public abstract record Error
{
    public static NotFoundError NotFound(string resource, string? message = null)
        => message is not null ? new(resource, message) : new(resource);
    public static ConflictError Conflict(string resource, string? message = null)
        => message is not null ? new(resource, message) : new(resource);
    public static ValidationError Validation(
        IEnumerable<FieldValidationError> fieldValidationErrors)
        => new(fieldValidationErrors);
}
