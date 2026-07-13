using FinanceManager.Domain.FinancialAccounts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceManager.Infrastructure.Data.Configuration;

internal sealed class FinancialAccountConfiguration : IEntityTypeConfiguration<FinancialAccount>
{
    public void Configure(EntityTypeBuilder<FinancialAccount> builder)
    {
        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();
    }
}
