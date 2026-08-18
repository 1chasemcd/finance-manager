using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.People;

namespace FinanceManager.Application.Features.People.Write;

internal sealed class WritepersonMapper : IMapper<WritePersonRequest, Person>
{
    public Person Map(WritePersonRequest source)
        => Person.Create(source.FirstName, source.LastName);
}
