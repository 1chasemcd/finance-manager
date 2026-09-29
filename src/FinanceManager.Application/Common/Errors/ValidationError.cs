namespace FinanceManager.Application.Common.Errors;

public sealed record ValidationError(IEnumerable<FieldValidationError> FieldValidationErrors) : Error;
public sealed record FieldValidationError(string Field, string Message);
