namespace FinanceManager.Application.Abstractions.Services;

public interface IUpdateMapper<in TSource, in TDestination>
{
    void Map(TSource source, TDestination destination);
}
