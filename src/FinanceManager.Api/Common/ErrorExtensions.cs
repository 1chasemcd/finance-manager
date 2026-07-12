using FinanceManager.Application.Common.Errors;

namespace FinanceManager.Api.Common;

public static class ErrorExtensions
{
    public static IResult ToHttpResult(this Error error)
    {
        return error switch
        {
            ConflictError conflict => TypedResults.Conflict(new
            {
                conflict.Code,
                conflict.Message
            }),

            NotFoundError notFound => TypedResults.NotFound(new
            {
                notFound.Code,
                notFound.Message
            }),
            ValidationError validation => TypedResults.UnprocessableEntity(new
            {
                validation.Code,
                validation.Message
            }),

            Error e => TypedResults.Problem(
                title: e.Code,
                detail: e.Message),
        };
    }
}
