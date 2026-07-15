namespace FinanceManager.Application.Abstractions;

public interface IEntityAssociationRegistryFor
{
    Type GetRequired(EntityAssociationFeature feature);
    Type? GetOptional(EntityAssociationFeature feature);

}
