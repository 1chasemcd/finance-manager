namespace FinanceManager.Application.Common.Errors;

public sealed record ConflictError(
    string Resource,
    string Message = "The request conflicts with the current state of the resource.")
    : Error;
