using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.Common;
using MediatR;

namespace FinanceManager.Application.Common.Autocomplete.Single;

public sealed record AutocompleteSingleQuery<TEntity>(int Id) : IRequest<Result<AutocompleteQueryResponse>>
    where TEntity : Entity;
