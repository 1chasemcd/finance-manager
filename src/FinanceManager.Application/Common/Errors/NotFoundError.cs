namespace FinanceManager.Application.Common.Errors;

public sealed record NotFoundError(
    string Resource,
    string Message = "The requested resource could not be found.")
    : Error;
