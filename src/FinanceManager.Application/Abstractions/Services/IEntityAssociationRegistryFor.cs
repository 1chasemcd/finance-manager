namespace FinanceManager.Application.Abstractions.Services;

public interface IEntityAssociationRegistryFor
{
    Type GetRequired(EntityAssociationFeature feature);
    Type? GetOptional(EntityAssociationFeature feature);

}
