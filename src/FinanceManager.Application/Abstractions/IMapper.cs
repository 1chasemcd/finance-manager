namespace FinanceManager.Application.Abstractions;

internal interface IMapper<in TSource, out TDestination>
{
    TDestination Map(TSource source);
}
