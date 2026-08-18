using FinanceManager.Domain.TransactionSources;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceManager.Infrastructure.Data.Configuration;

internal sealed class TransactionSourceConfiguration : IEntityTypeConfiguration<TransactionSource>
{
    public void Configure(EntityTypeBuilder<TransactionSource> builder)
    {
        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();
    }
}
