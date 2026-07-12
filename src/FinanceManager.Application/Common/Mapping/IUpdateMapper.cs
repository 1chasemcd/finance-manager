namespace FinanceManager.Application.Common.Mapping;

public interface IUpdateMapper<in TSource, in TDestination>
{
    void Map(TSource source, TDestination destination);
}
