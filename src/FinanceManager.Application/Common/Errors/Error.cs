namespace FinanceManager.Application.Common.Errors;

public record Error(string Code, string Message)
{
    public static NotFoundError NotFound(string resource) => new(resource);
    public static BusinessRuleError BusinessRule(string code, string message) => new(code, message);
    public static ConflictError Conflict(string resource) => new(resource);
    public static ValidationError Validation(string code, string message) => new(code, message);
}
