using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityQueries;
using FinanceManager.Application.Common.EntityQueries.GetEntity;
using FinanceManager.Domain.Common;
using Moq;

namespace FinanceManager.Application.Tests;

public class EntityQueryFactoryTests
{
    private class TestEntity : Entity;
    private record TestGetResponse(int Value) : IGetResponse<TestEntity>;
    private readonly Mock<IServiceProvider> _serviceProvider;
    private readonly EntityQueryFactory _factory;

    public EntityQueryFactoryTests()
    {
        _serviceProvider = new Mock<IServiceProvider>();
        _serviceProvider.Setup(x => x.GetService(It.IsAny<Type>())).Returns(new object());
        _factory = new(_serviceProvider.Object);
    }

    [Fact]
    public void BuildCreateEntityCommandDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(GetEntityHandler<TestGetResponse, TestEntity>);
        var func = _factory.BuildGetEntityQueryDelegate<TestGetResponse>();
        var res = func(5);
        var resAsQuery = Assert.IsType<GetEntityQuery<TestGetResponse, TestEntity>>(res);
        Assert.Equal(5, resAsQuery.Id);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }
}
