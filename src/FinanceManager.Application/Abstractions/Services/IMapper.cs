namespace FinanceManager.Application.Abstractions.Services;

public interface IMapper<in TSource, out TDestination>
{
    TDestination Map(TSource source);
}
