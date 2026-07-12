using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.EntityCommands;
using FinanceManager.Application.Common.EntityCommands.CreateEntity;
using FinanceManager.Application.Common.EntityCommands.DeleteEntity;
using FinanceManager.Application.Common.EntityCommands.UpdateEntity;
using FinanceManager.Domain.Common;
using Moq;

namespace FinanceManager.Application.Tests;

public class EntityCommandFactoryTests
{
    private class TestEntity : Entity;
    private record TestCreateRequest(int Parameter) : ICreateRequest<TestEntity>;
    private record TestUpdateRequest(int Parameter) : IUpdateRequest<TestEntity>
    {
        public int Id { get; init; }
    }
    private record TestDeleteRequest(int Parameter) : IDeleteRequest<TestEntity>
    {
        public int Id { get; init; }
    }

    private readonly Mock<IServiceProvider> _serviceProvider;
    private readonly EntityCommandFactory _factory;

    public EntityCommandFactoryTests()
    {
        _serviceProvider = new Mock<IServiceProvider>();
        _serviceProvider.Setup(x => x.GetService(It.IsAny<Type>())).Returns(new object());
        _factory = new(_serviceProvider.Object);
    }

    [Fact]
    public void BuildCreateDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(CreateEntityHandler<TestCreateRequest, TestEntity>);
        var func = _factory.BuildCreateDelegate<TestCreateRequest>();
        var request = new TestCreateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<CreateEntityCommand<TestCreateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }

    [Fact]
    public void BuildUpdateDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(UpdateEntityHandler<TestUpdateRequest, TestEntity>);
        var func = _factory.BuildUpdateDelegate<TestUpdateRequest>();
        var request = new TestUpdateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<UpdateEntityCommand<TestUpdateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }

    [Fact]
    public void BuildDeleteDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(DeleteEntityHandler<TestEntity>);
        var func = _factory.BuildDeleteDelegate<TestDeleteRequest>();
        var res = func(5);
        var resAsCommand = Assert.IsType<DeleteEntityCommand<TestEntity>>(res);
        Assert.Equal(5, resAsCommand.Id);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }
}
