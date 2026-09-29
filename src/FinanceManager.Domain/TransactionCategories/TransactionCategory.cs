using FinanceManager.Domain.Common;

namespace FinanceManager.Domain.TransactionCategories;

public sealed class TransactionCategory : Entity
{
    public string Name { get; set; }
    public string? Description { get; set; }
    private TransactionCategory()
    {
        Name = null!;
    }
    public static TransactionCategory Create(string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        var cat = new TransactionCategory
        {
            Name = name,
            Description = description
        };
        return cat;
    }
}
