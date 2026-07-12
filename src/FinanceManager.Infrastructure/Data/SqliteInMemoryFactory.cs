using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Infrastructure.Data;

public static class SqliteInMemoryFactory
{
    public static IServiceCollection AddInMemoryDb(this IServiceCollection services)
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        services.AddSingleton(connection);

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            SqliteConnection sqliteConnection = sp.GetRequiredService<SqliteConnection>();

            options.UseSqlite(sqliteConnection);
        });

        return services;
    }
}
