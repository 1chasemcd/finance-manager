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

    private readonly EntityCommandFactory _factory;

    public EntityCommandFactoryTests()
    {
        _factory = new();
    }

    [Fact]
    public void BuildCreateDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildCreateDelegate<TestCreateRequest>();
        var request = new TestCreateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<CreateEntityCommand<TestCreateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
    }

    [Fact]
    public void BuildUpdateDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildUpdateDelegate<TestUpdateRequest>();
        var request = new TestUpdateRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<UpdateEntityCommand<TestUpdateRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
    }

    [Fact]
    public void BuildDeleteDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildDeleteDelegate<TestDeleteRequest>();
        var request = new TestDeleteRequest(5);
        var res = func(request);
        var resAsCommand = Assert.IsType<DeleteEntityCommand<TestDeleteRequest, TestEntity>>(res);
        Assert.Equal(request, resAsCommand.Request);
    }
}
