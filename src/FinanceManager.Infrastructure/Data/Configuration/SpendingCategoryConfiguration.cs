using FinanceManager.Domain.SpendingCategories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceManager.Infrastructure.Data.Configuration;

internal sealed class SpendingCategoryConfiguration : IEntityTypeConfiguration<SpendingCategory>
{
    public void Configure(EntityTypeBuilder<SpendingCategory> builder)
    {
        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(x => x.Description)
            .HasMaxLength(500);
    }
}
