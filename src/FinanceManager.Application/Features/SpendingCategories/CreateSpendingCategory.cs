using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Common.Persistence;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.SpendingCategories;
using MediatR;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record CreateSpendingCategoryRequest : IRequest<Result<int>>
{
    [MaxLength(100)]
    [Required]
    public required string Name { get; init; }
    [MaxLength(500)]
    public string? Description { get; init; }
}

public class CreateSpendingCategoryRequestHandler(IApplicationDbContext db) : IRequestHandler<CreateSpendingCategoryRequest, Result<int>>
{
    public async Task<Result<int>> Handle(CreateSpendingCategoryRequest request, CancellationToken cancellationToken)
    {
        SpendingCategory cat = new(request.Name, request.Description);
        db.SpendingCategories.Add(cat);
        await db.SaveChangesAsync(cancellationToken);
        return cat.Id;
    }
}
