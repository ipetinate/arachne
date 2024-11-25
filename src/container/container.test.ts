import 'reflect-metadata'

import { ModuleMetadata } from '@/models'
import { Module, Mutation, Query, Resolver } from '@/decorators'
import { AppBuilder, Container, create, IoCContainer } from '@/container'

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = IoCContainer
  })

  it('should throw an error if trying to register a service without serviceKey metadata', () => {
    class TestService {}

    expect(() => container.register(TestService)).toThrow(
      `Missing serviceKey metadata for TestService`
    )
  })

  it('should register a service with a custom scope', () => {
    class TestService {}
    Reflect.defineMetadata('serviceKey', Symbol('TestService'), TestService)

    container.register(TestService, 'transient')

    const serviceEntry = container['services'].get(
      Reflect.getMetadata('serviceKey', TestService)
    )

    expect(serviceEntry).toBeDefined()
    expect(serviceEntry.scope).toBe('transient')
    expect(serviceEntry.implementation).toBe(TestService)
  })

  it('should throw an error if serviceKey metadata is missing', () => {
    class TestInjectable {}

    expect(() => container.resolve<TestInjectable>(TestInjectable)).toThrow(
      `Missing serviceKey metadata for TestInjectable`
    )
  })

  it('should register a service with default scope as singleton', () => {
    class TestService {}
    Reflect.defineMetadata('serviceKey', Symbol('TestService'), TestService)

    container.register(TestService)

    const serviceEntry = container['services'].get(
      Reflect.getMetadata('serviceKey', TestService)
    )

    expect(serviceEntry).toBeDefined()
    expect(serviceEntry.scope).toBe('singleton')
    expect(serviceEntry.implementation).toBe(TestService)
  })

  it('should resolve a singleton service', () => {
    class TestService {}
    Reflect.defineMetadata('serviceKey', Symbol('TestService'), TestService)

    container.register(TestService)
    const instance1 = container.resolve<TestService>(TestService)
    const instance2 = container.resolve<TestService>(TestService)

    expect(instance1).toBe(instance2)
  })

  it('should resolve a transient service', () => {
    class TestService {}
    Reflect.defineMetadata('serviceKey', Symbol('TestService'), TestService)

    container.register(TestService, 'transient')
    const instance1 = container.resolve<TestService>(TestService)
    const instance2 = container.resolve<TestService>(TestService)

    expect(instance1).not.toBe(instance2)
  })

  it('should load a module and register its providers', () => {
    class TestProvider {}
    Reflect.defineMetadata('serviceKey', Symbol('TestProvider'), TestProvider)
    Reflect.defineMetadata('serviceScope', 'singleton', TestProvider)

    const moduleMetadata: ModuleMetadata = {
      providers: [TestProvider]
    }
    Reflect.defineMetadata('module:options', moduleMetadata, TestProvider)

    container.loadModule(TestProvider)

    const serviceEntry = container['services'].get(
      Reflect.getMetadata('serviceKey', TestProvider)
    )

    expect(serviceEntry).toBeDefined()
    expect(serviceEntry.scope).toBe('singleton')
    expect(serviceEntry.implementation).toBe(TestProvider)
  })

  it('should collect GraphQL schema and resolvers', async () => {
    @Resolver()
    class TestResolver {
      @Mutation()
      testMutation(): string {
        return 'test mutation return'
      }

      @Query()
      findQuery(): string {
        return 'test query return'
      }
    }

    const moduleMetadata: ModuleMetadata = {
      resolvers: [TestResolver],
      schema: `type Query { test: String }`
    }

    @Module(moduleMetadata)
    class TestModule {}

    await create(TestModule)

    const graphQLData = IoCContainer.collectGraphQL()

    expect(graphQLData.schema).toContain('type Query { test: String }')
    expect(await graphQLData.resolvers.Query.findQuery()).toBe(
      'test query return'
    )
  })

  it('should create an AppBuilder instance', async () => {
    class TestModule {}
    Reflect.defineMetadata('module:options', {}, TestModule)

    const appBuilder = await create(TestModule)

    expect(appBuilder).toBeInstanceOf(AppBuilder)
  })
})
