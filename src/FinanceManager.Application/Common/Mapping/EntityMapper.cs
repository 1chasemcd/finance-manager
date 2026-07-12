using FinanceManager.Domain.Common;

namespace FinanceManager.Application.Common.Mapping;

public sealed class EntityMapper
{
    public Entity MapToEntity<T>(T model)
    {
        return null!;
    }

    public T MapFromEntity<T>(Entity entity)
    {
        return default!;
    }
}
