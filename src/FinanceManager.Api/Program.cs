using FinanceManager.Api.Endpoints;
using FinanceManager.Application.Abstractions;
using Microsoft.AspNetCore.Http.Json;
using System.Text.Json.Serialization;

namespace FinanceManager.Api;

public sealed class Program
{
    public static async Task Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Services.AddOpenApi();

        builder
            .AddApplicationServices()
            .AddInfrastructureServices();

        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
        });

        WebApplication app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            await app.Services.SeedDataAsync();
        }

        app.UseHttpsRedirection();

        RouteGroupBuilder api = app.MapGroup("/api");
        api.RegisterSpendingCategoryEndpoints();

        app.Services
            .GetRequiredService<IEntityAssociationRegistry>()
            .Dispose();

        app.Run();
    }
}
