namespace FinanceManager.Application.Abstractions.Services;

internal interface IUpdateMapper<in TSource, in TDestination>
{
    void Map(TSource source, TDestination destination);
}
