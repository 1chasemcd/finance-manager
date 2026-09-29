using FinanceManager.Application.Common.Results;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

static class ResultExtensions
{
    public static Results<Ok<T>, ValidationProblem, Conflict<ProblemDetails>, NotFound<ProblemDetails>> ToHttpResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return TypedResults.Ok(result.Value);
        return result.Error.ToHttpResult<Ok<T>>();
    }

    public static Results<NoContent, ValidationProblem, Conflict<ProblemDetails>, NotFound<ProblemDetails>> ToHttpResult(this Result result)
    {
        if (result.IsSuccess)
            return TypedResults.NoContent();
        return result.Error.ToHttpResult<NoContent>();
    }
}
