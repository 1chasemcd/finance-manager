using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IQueryRequest
{
    int Skip { get; init; }
    int? Take { get; init; }
}
public interface IQueryRequest<TEntity> : IQueryRequest where TEntity : Entity;
