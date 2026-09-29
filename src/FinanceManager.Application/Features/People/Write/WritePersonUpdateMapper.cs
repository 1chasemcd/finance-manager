using FinanceManager.Application.Abstractions;
using FinanceManager.Domain.People;

namespace FinanceManager.Application.Features.People.Write;

internal sealed class WritePersonRequestMapper : IUpdateMapper<WritePersonRequest, Person>
{
    public void Map(WritePersonRequest source, Person destination)
    {
        destination.FirstName = source.FirstName;
        destination.LastName = source.LastName;
    }
}
