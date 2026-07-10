using System.Diagnostics;
using FinanceManager.Application.Common.Errors;

namespace FinanceManager.Application.Common.Results;

public record Result
{
    public bool IsSuccess => Error is null;
    public Error? Error { get; protected set; }
    protected Result(Error error)
    {
        ArgumentNullException.ThrowIfNull(error);
        Error = error;
    }

    protected Result() { }
    public static Result Success => new();
    public static implicit operator Result(Error error) => new(error);

    public Result<TNext> Then<TNext>(Func<Result<TNext>> func)
    {
        if (Error is not null) return Error;
        return func.Invoke();
    }
}

public record Result<T> : Result
{
    public T? Value { get; }
    private Result(T value)
    {
        Error = new NoError();
        Value = value;
    }
    public static implicit operator Result<T>(T value) => new(value);
    public static implicit operator Result<T>(Error error) => new(error);

    public Result<TNext> Then<TNext>(Func<T, Result<TNext>> func)
    {
        if (Error is not null) return Error;
        if (Value is not null) return func.Invoke(Value);
        throw new UnreachableException();
    }
}
