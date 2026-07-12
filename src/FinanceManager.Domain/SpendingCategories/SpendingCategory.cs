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
    public static SpendingCategory Create(string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        var cat = new SpendingCategory
        {
            Name = name,
            Description = description
        };
        return cat;
    }

    public void UpdateDescription(string? newDescription)
    {
        Description = newDescription;
    }
}
