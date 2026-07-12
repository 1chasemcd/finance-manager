using System.ComponentModel.DataAnnotations;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IGetRequest
{
    int Id { get; init; }
}
public interface IGetRequest<TEntity> : IGetRequest where TEntity : Entity;
