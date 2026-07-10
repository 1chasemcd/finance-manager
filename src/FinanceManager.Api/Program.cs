using FinanceManager.Application.Common.Results;
using FinanceManager.Application.Features.SpendingCategories;
using MediatR;
using Microsoft.AspNetCore.Http.Json;
using System.Text.Json.Serialization;

namespace FinanceManager.Api;

public class Program
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

        api.MapGet("/spendingcategories/{id}", async (int id, ISender sender) =>
        {
            Result<SpendingCategoryResponse> result = await sender.Send(new GetSpendingCategoryRequest(id));
            return result.ToHttpResult();
        })
        .WithName("GetSpendingCategories");

        api.MapPost("/spendingcategories", async (CreateSpendingCategoryRequest request, ISender sender) =>
            (await sender.Send(request)).ToCreatedHttpResult("/spendingcategories")
            )
        .WithName("CreateSpendingCategory");
        app.Run();
    }
}
