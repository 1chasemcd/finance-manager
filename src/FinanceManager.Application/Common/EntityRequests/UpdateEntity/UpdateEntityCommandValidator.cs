using FinanceManager.Domain.Common;
using FluentValidation;

namespace FinanceManager.Application.Common.EntityRequests.UpdateEntity;

public sealed class UpdateEntityCommandValidator<TEntity, TRequest>
    : AbstractValidator<UpdateEntityCommand<TEntity, TRequest>>
    where TEntity : Entity
{
    public UpdateEntityCommandValidator(
        IValidator<TRequest>? requestValidator = null)
    {
        if (requestValidator == null)
            return;
        RuleFor(x => x.Request)
            .SetValidator(requestValidator);
    }
}
