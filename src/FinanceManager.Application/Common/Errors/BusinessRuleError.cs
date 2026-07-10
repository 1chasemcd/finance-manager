namespace FinanceManager.Application.Common.Errors;

public record BusinessRuleError(string Code, string Message) : Error(Code, Message);

