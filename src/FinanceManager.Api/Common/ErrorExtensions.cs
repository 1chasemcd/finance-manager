using FinanceManager.Application.Common.Errors;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FinanceManager.Api.Common;

static class ErrorExtensions
{
    public static Results<Conflict<string>, NotFound<string>, UnprocessableEntity<string>, ProblemHttpResult> ToHttpResult(this Error error)
    {
        var errorMessage = error.Code;
        if (!string.IsNullOrWhiteSpace(error.Code) && !string.IsNullOrWhiteSpace(error.Message))
            errorMessage += ": ";
        errorMessage += error.Message;

        return error switch
        {
            ConflictError => TypedResults.Conflict(errorMessage),
            NotFoundError => TypedResults.NotFound(errorMessage),
            ValidationError => TypedResults.UnprocessableEntity(errorMessage),
            Error => TypedResults.Problem(errorMessage),
        };
    }

    public static Results<TResult, Conflict<string>, NotFound<string>, UnprocessableEntity<string>, ProblemHttpResult> ToHttpResult<TResult>(this Error error)
        where TResult : IResult
    {
        return error.ToHttpResult().Result switch
        {
            Conflict<string> c => c,
            NotFound<string> c => c,
            UnprocessableEntity<string> c => c,
            ProblemHttpResult c => c,
            _ => TypedResults.Problem()
        };
    }

    public static Results<TResult1, TResult2, Conflict<string>, NotFound<string>, UnprocessableEntity<string>, ProblemHttpResult> ToHttpResult<TResult1, TResult2>(this Error error)
        where TResult1 : IResult
        where TResult2 : IResult
    {
        return error.ToHttpResult().Result switch
        {
            Conflict<string> c => c,
            NotFound<string> c => c,
            UnprocessableEntity<string> c => c,
            ProblemHttpResult c => c,
            _ => TypedResults.Problem()
        };
    }
}
