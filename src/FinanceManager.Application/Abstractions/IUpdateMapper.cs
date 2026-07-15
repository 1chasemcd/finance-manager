namespace FinanceManager.Application.Abstractions;

internal interface IUpdateMapper<in TSource, in TDestination>
{
    void Map(TSource source, TDestination destination);
}
