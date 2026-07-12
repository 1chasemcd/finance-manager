using FinanceManager.Application.Abstractions.Requests;
using FinanceManager.Application.Common.GenericCommands;
using FinanceManager.Application.Common.GenericCommands.CreateEntity;
using FinanceManager.Application.Common.GenericCommands.DeleteEntity;
using FinanceManager.Application.Common.GenericCommands.UpdateEntity;
using FinanceManager.Domain.Common;
using Moq;

namespace FinanceManager.Application.Tests;

public class GenericCommandFactoryTests
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
    private readonly GenericCommandFactory _commandFactory;

    public GenericCommandFactoryTests()
    {
        _serviceProvider = new Mock<IServiceProvider>();
        _serviceProvider.Setup(x => x.GetService(It.IsAny<Type>())).Returns(new object());
        _commandFactory = new(_serviceProvider.Object);
    }

    [Fact]
    public void BuildCreateCommandDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(CreateEntityHandler<TestCreateRequest, TestEntity>);
        var func = _commandFactory.BuildCreateCommandDelegate<TestCreateRequest>();
        var request = new TestCreateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<CreateEntityCommand<TestCreateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }

    [Fact]
    public void BuildUpdateCommandDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(UpdateEntityHandler<TestUpdateRequest, TestEntity>);
        var func = _commandFactory.BuildUpdateCommandDelegate<TestUpdateRequest>();
        var request = new TestUpdateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<UpdateEntityCommand<TestUpdateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }

    [Fact]
    public void BuildDeleteCommandDelegate_WithValidRequest_BuildsDelegate()
    {
        var expectedHandlerService = typeof(DeleteEntityHandler<TestDeleteRequest, TestEntity>);
        var func = _commandFactory.BuildDeleteCommandDelegate<TestDeleteRequest>();
        var request = new TestDeleteRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<DeleteEntityCommand<TestDeleteRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
        _serviceProvider.Verify(x => x.GetService(expectedHandlerService));
    }
}
