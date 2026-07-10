namespace FinanceManager.Application.Common.Errors;

public record ValidationError(string Code, string Message) : Error(Code, Message);
