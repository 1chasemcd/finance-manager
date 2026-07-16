using FinanceManager.Api.Endpoints;
using FinanceManager.Application.Abstractions;
using MicroElements.AspNetCore.OpenApi.FluentValidation;
using Microsoft.AspNetCore.Http.Json;
using System.Text.Json.Serialization;

namespace FinanceManager.Api;

public sealed class Program
{
    public static async Task Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder
            .AddApplicationServices()
            .AddInfrastructureServices();

        builder.Services.AddFluentValidationRulesToOpenApi();
        builder.Services.AddOpenApi(options =>
        {
            options.AddFluentValidationRules();
        });


        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
        });

        WebApplication app = builder.Build();

        if (app.Environment.IsDevelopment())
            app.MapOpenApi();

        app.UseHttpsRedirection();

        RouteGroupBuilder api = app.MapGroup("/api");
        api.RegisterSpendingCategoryEndpoints();
        api.RegisterFinancialTransactionEndpoints();
        api.RegisterFinancialAccountEndpoints();
        api.RegisterAutocompleteEndpoints();

        app.Services
            .GetRequiredService<IEntityAssociationRegistry>()
            .Dispose();

        app.Run();
    }
}
