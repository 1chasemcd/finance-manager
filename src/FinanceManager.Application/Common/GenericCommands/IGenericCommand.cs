namespace FinanceManager.Application.Common.GenericCommands;

public interface IGenericCommand<TRequest>
{
    TRequest Request { get; init; }
}
