using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.EntityQueries;
using FinanceManager.Application.Common.EntityQueries.GetEntity;
using FinanceManager.Domain.Common;
using Moq;

namespace FinanceManager.Application.Tests;

public class EntityQueryFactoryTests
{
    private class TestEntity : Entity;
    private record TestGetResponse(int Value) : IGetResponse<TestEntity>;
    private readonly EntityQueryFactory _factory;

    public EntityQueryFactoryTests()
    {
        _factory = new();
    }

    [Fact]
    public void BuildCreateEntityCommandDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildGetEntityQueryDelegate<TestGetResponse>();
        var res = func(5);
        var resAsQuery = Assert.IsType<GetEntityQuery<TestGetResponse, TestEntity>>(res);
        Assert.Equal(5, resAsQuery.Id);
    }
}
