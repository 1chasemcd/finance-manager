using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.SpendingCategories;

public sealed class SpendingCategory : Entity
{
    public string Name { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    private SpendingCategory() { }
    public SpendingCategory(string name, string description)
    {
        Name = name;
        Description = description;
    }
}
