namespace FinanceManager.Application.Abstractions.Services;

internal interface IMapper<in TSource, out TDestination>
{
    TDestination Map(TSource source);
}
