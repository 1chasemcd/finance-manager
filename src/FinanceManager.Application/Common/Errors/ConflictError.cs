namespace FinanceManager.Application.Common.Errors;

public record ConflictError(
    string Resource,
    string Message = "A resource with the specified id already exists")
    : Error($"{Resource}.Conflict", Message);
