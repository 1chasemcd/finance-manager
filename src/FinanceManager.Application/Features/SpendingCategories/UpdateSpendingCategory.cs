using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Persistence;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.SpendingCategories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record UpdateSpendingCategoryRequest : IRequest<Result>
{
    public int id { get; init; }
    [MaxLength(500)]
    public string? Description { get; init; }
}

public sealed class UpdateSpendingCategoryRequestHandler(IApplicationDbContext db) : IRequestHandler<UpdateSpendingCategoryRequest, Result>
{
    public async Task<Result> Handle(UpdateSpendingCategoryRequest request, CancellationToken cancellationToken)
    {
        SpendingCategory? cat = await db.SpendingCategories.FindAsync([request.id], cancellationToken);
        if (cat is null) return SpendingCategoryError.NotFound;
        cat.UpdateDescription(request.Description);
        return Result.Success;
    }
}
