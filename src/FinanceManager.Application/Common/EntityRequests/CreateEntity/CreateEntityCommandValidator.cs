using FinanceManager.Domain.Common;
using FluentValidation;

namespace FinanceManager.Application.Common.EntityRequests.CreateEntity;

public sealed class CreateEntityCommandValidator<TEntity, TRequest>
    : AbstractValidator<CreateEntityCommand<TEntity, TRequest>>
    where TEntity : Entity
{
    public CreateEntityCommandValidator(
        IValidator<TRequest>? requestValidator = null)
    {
        if (requestValidator == null)
            return;
        RuleFor(x => x.Request)
            .SetValidator(requestValidator)
            .OverridePropertyName("");
    }
}
