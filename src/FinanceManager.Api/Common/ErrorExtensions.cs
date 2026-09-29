using System.Diagnostics;
using System.Text.Json;
using FinanceManager.Application.Common.Errors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Api.Common;

static class ErrorExtensions
{
    private static JsonNamingPolicy? s_propertyNameingPolicy;
    public static void SetPropertyNamingPolicy(JsonNamingPolicy? propertyNamingPolicy)
    {
        s_propertyNameingPolicy = propertyNamingPolicy;
    }
    public static Results<ValidationProblem, Conflict<ProblemDetails>, NotFound<ProblemDetails>> ToHttpResult(this Error error)
    {
        return error switch
        {
            ConflictError conflict => TypedResults.Conflict(new ProblemDetails
            {
                Title = "Conflict",
                Status = StatusCodes.Status409Conflict,
                Detail = conflict.Message
            }
            ),
            NotFoundError notFound => TypedResults.NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Status = StatusCodes.Status404NotFound,
                Detail = notFound.Message
            }),
            ValidationError validation => TypedResults.ValidationProblem(
                validation.FieldValidationErrors
                .GroupBy(err => err.Field)
                .ToDictionary(
                    group => s_propertyNameingPolicy?.ConvertName(group.Key) ?? group.Key,
                    group => group.Select(err => err.Message).ToArray())),
            Error => throw new UnreachableException($"Unable to handle error result {error.GetType().FullName}"),
        };
    }

    public static Results<TResult, ValidationProblem, Conflict<ProblemDetails>, NotFound<ProblemDetails>> ToHttpResult<TResult>(this Error error)
        where TResult : IResult
    {
        return error.ToHttpResult().Result switch
        {
            ValidationProblem c => c,
            Conflict<ProblemDetails> c => c,
            NotFound<ProblemDetails> c => c,
            _ => throw new UnreachableException()
        };
    }
}
