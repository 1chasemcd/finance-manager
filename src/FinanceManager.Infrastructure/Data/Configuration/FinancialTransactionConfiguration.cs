using FinanceManager.Domain.FinancialTransactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceManager.Infrastructure.Data.Configuration;

internal sealed class FinancialTransactionConfiguration : IEntityTypeConfiguration<FinancialTransaction>
{
    public void Configure(EntityTypeBuilder<FinancialTransaction> builder)
    {
        builder.Property(x => x.Summary)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2);
    }
}
