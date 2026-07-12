using FinanceManager.Application.Common.Errors;

namespace FinanceManager.Application.Common.GenericCommands;

public static class GenericCommandError
{
    public static NotFoundError NotFound<T>() => new(typeof(T).Name);
}
