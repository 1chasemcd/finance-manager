using FinanceManager.Application.Abstractions.Messages;
using FinanceManager.Application.Common.EntityRequests;
using FinanceManager.Application.Common.EntityRequests.CreateEntity;
using FinanceManager.Application.Common.EntityRequests.DeleteEntity;
using FinanceManager.Application.Common.EntityRequests.GetEntity;
using FinanceManager.Application.Common.EntityRequests.ListEntities;
using FinanceManager.Application.Common.EntityRequests.UpdateEntity;
using FinanceManager.Domain.Common;

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

    private record TestGetResponse(int Value) : IGetResponse<TestEntity>;
    private record TestListRequest(int Value) : IListRequest<TestEntity>
    {
        public int Skip { get; init; }
        public int Take { get; init; }
    }

    private readonly EntityRequestFactory _factory;

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

    [Fact]
    public void BuildGetDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildGetDelegate<TestGetResponse>();
        var res = func(5);
        var resAsQuery = Assert.IsType<GetEntityQuery<TestGetResponse, TestEntity>>(res);
        Assert.Equal(5, resAsQuery.Id);
    }

    [Fact]
    public void BuildListDelegate_WithValidRequest_BuildsDelegate()
    {
        var func = _factory.BuildListDelegate<TestListRequest, TestGetResponse>();
        var request = new TestListRequest(5);
        var res = func(request);
        var resAsQuery = Assert.IsType<ListEntitiesQuery<TestListRequest, TestGetResponse, TestEntity>>(res);
        Assert.Equal(5, resAsQuery.Request.Value);
    }
}
