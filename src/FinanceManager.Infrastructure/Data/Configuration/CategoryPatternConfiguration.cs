using FinanceManager.Domain.CategoryPatterns;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceManager.Infrastructure.Data.Configuration;

internal sealed class CategoryPatternConfiguration : IEntityTypeConfiguration<CategoryPattern>
{
    public void Configure(EntityTypeBuilder<CategoryPattern> builder)
    {
        builder.Property(x => x.Pattern)
            .HasMaxLength(100)
            .IsRequired();
    }
}
