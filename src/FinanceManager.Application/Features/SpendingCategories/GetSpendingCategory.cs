using System.ComponentModel.DataAnnotations;
using FinanceManager.Application.Abstractions.Persistence;
using FinanceManager.Application.Common.Mapping;
using FinanceManager.Application.Common.Results;
using FinanceManager.Domain.SpendingCategories;

using MediatR;

namespace FinanceManager.Application.Features.SpendingCategories;

public sealed record GetSpendingCategoryRequest : IRequest<Result<SpendingCategoryResponse>>
{
    public GetSpendingCategoryRequest(int id)
    {
        Id = id;
    }
    [Required]
    public int Id { get; init; }
}

public class GetSpendingCategoryRequestHandler(
    IApplicationDbContext db, IMapper<SpendingCategory,
    SpendingCategoryResponse> mapper)
    : IRequestHandler<GetSpendingCategoryRequest, Result<SpendingCategoryResponse>>
{
    public async Task<Result<SpendingCategoryResponse>> Handle(GetSpendingCategoryRequest request, CancellationToken cancellationToken)
    {
        SpendingCategory? cat = await db.Set<SpendingCategory>().FindAsync([request.Id], cancellationToken);
        if (cat is null) return SpendingCategoryError.NotFound;
        return mapper.Map(cat);
    }
}
