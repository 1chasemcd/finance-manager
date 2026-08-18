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

        builder
            .AddInfrastructureServices()
            .AddApplicationServices();

        builder.Services.AddOpenApi();

        var allowedOrigins =
            builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? [];
        if (allowedOrigins.Length > 0)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });


        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
        });

        WebApplication app = builder.Build();

        // if (app.Environment.IsDevelopment())
        app.MapOpenApi();

        app.UseHttpsRedirection();
        if (allowedOrigins.Length > 0)
            app.UseCors("Frontend");

        RouteGroupBuilder api = app.MapGroup("/api");
        api.RegisterTransactionCategoryEndpoints();
        api.RegisterTransactionEndpoints();
        api.RegisterTransactionSourceEndpoints();
        api.RegisterPersonEndpoints();
        api.RegisterAutocompleteEndpoints();

        app.Services
            .GetRequiredService<IEntityAssociationRegistry>()
            .Dispose();

        app.Run();
    }
}
