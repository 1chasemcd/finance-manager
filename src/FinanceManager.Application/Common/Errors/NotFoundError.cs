namespace FinanceManager.Application.Common.Errors;

public record NotFoundError(
    string Resource,
    string Message = "The resource with the specified id was not found")
    : Error($"{Resource}.NotFound", Message);
