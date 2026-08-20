namespace FinanceManager.Application.Common.Errors;

public sealed record ConflictError(
    string Message = "The request conflicts with the current state of the resource.")
    : Error;
