using FinanceManager.Application.Common.Errors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

static class ErrorExtensions
{
    public static Results<ValidationProblem, ProblemHttpResult> ToHttpResult(this Error error)
    {
        return error switch
        {
            ConflictError conflict => TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: $"Conflict on {conflict.Resource}",
                detail: conflict.Message
            ),
            NotFoundError notFound => TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: $"{notFound.Resource} Not Found",
                detail: notFound.Message
            ),
            ValidationError validation => TypedResults.ValidationProblem(
                validation.FieldValidationErrors
                .GroupBy(err => err.Field)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(err => err.Message).ToArray())),
            Error => TypedResults.Problem(),
        };
    }

    public static Results<TResult, ValidationProblem, ProblemHttpResult> ToHttpResult<TResult>(this Error error)
        where TResult : IResult
    {
        return error.ToHttpResult().Result switch
        {
            ProblemHttpResult c => c,
            ValidationProblem c => c,
            _ => TypedResults.Problem()
        };
    }

    public static Results<TResult1, TResult2, ValidationProblem, ProblemHttpResult> ToHttpResult<TResult1, TResult2>(this Error error)
        where TResult1 : IResult
        where TResult2 : IResult
    {
        return error.ToHttpResult().Result switch
        {
            ProblemHttpResult c => c,
            ValidationProblem c => c,
            _ => TypedResults.Problem()
        };
    }
}
