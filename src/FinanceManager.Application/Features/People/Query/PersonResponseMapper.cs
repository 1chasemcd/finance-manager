using System.Linq.Expressions;
using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.People;

namespace FinanceManager.Application.Features.People.Query;

internal sealed class PersonResponseMapper : IExpressionMapper<Person, PersonResponse>
{
    public Expression<Func<Person, PersonResponse>> Map => (source) =>
        new PersonResponse
        {
            Id = source.Id,
            FirstName = source.FirstName,
            LastName = source.LastName
        };
}
