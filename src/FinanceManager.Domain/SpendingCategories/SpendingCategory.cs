using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.SpendingCategories;

public sealed class SpendingCategory : Entity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    private SpendingCategory()
    {
        Name = null!;
    }
    public SpendingCategory(string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name;
        Description = description;
    }

    public void UpdateDescription(string? newDescription)
    {
        Description = newDescription;
    }
}
