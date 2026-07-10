using System.Diagnostics;
using FinanceManager.Application.Common.Errors;
using FinanceManager.Application.Common.Results;

namespace FinanceManager.Api;

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);
        return MapError(result.Error);
    }

    public static IResult ToCreatedHttpResult<T>(
    this Result<T> result,
    string location)
    {
        if (result.IsSuccess)
            return Results.Created(location, result.Value);
        return MapError(result.Error);
    }

    private static IResult MapError(Error error)
    {
        return error switch
        {
            ConflictError conflict => Results.Conflict(new
            {
                conflict.Code,
                conflict.Message
            }),

            NotFoundError notFound => Results.NotFound(new
            {
                notFound.Code,
                notFound.Message
            }),

            BusinessRuleError businessRule => Results.BadRequest(new
            {
                businessRule.Code,
                businessRule.Message
            }),

            Error e => Results.Problem(
                title: e.Code,
                detail: e.Message),
        };
    }
}
