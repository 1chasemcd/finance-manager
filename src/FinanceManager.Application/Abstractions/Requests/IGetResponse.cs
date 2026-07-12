using System.ComponentModel.DataAnnotations;
using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Abstractions.Requests;

public interface IGetResponse;
public interface IGetResponse<TEntity> : IGetResponse where TEntity : Entity;
