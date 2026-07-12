using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;

namespace FinanceManager.Api.Common;

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result, Func<T, IResult>? onSuccess = null)
    {
        onSuccess ??= x => TypedResults.Ok(x);

        if (result.IsSuccess)
            return onSuccess(result.Value);
        return result.Error.ToHttpResult();
    }

    public static IResult ToHttpResult(this Result result, Func<IResult>? onSuccess = null)
    {
        onSuccess ??= () => Results.NoContent();

        if (result.IsSuccess)
            return onSuccess();
        return result.Error.ToHttpResult();
    }
}
