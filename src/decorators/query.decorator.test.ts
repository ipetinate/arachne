import 'reflect-metadata'

import { create, IoCContainer } from '@/container'
import { Query, Module, Resolver, Injectable } from '@/decorators'

describe('Query Decorator', () => {
  let target: any
  let propertyKey: string | symbol
  let descriptor: PropertyDescriptor

  beforeEach(() => {
    target = {}
    propertyKey = 'testMethod'
    descriptor = {
      value: () => 'test'
    }
  })

  it('should add metadata to the target', () => {
    const queryDecorator = Query()
    queryDecorator(target, propertyKey, descriptor)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(1)
    expect(queries[0]).toEqual({ name: propertyKey, method: descriptor.value })
  })

  it('should append to existing metadata', () => {
    Reflect.defineMetadata(
      'graphql:queries',
      [{ name: 'existingMethod', method: () => 'existing' }],
      target
    )

    const queryDecorator = Query()
    queryDecorator(target, propertyKey, descriptor)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(2)
    expect(queries[1]).toEqual({ name: propertyKey, method: descriptor.value })
  })

  it('should handle multiple queries', () => {
    const queryDecorator1 = Query()
    const queryDecorator2 = Query()
    const descriptor2 = { value: () => 'test2' }

    queryDecorator1(target, propertyKey, descriptor)
    queryDecorator2(target, 'testMethod2', descriptor2)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(2)
    expect(queries[0]).toEqual({ name: propertyKey, method: descriptor.value })
    expect(queries[1]).toEqual({
      name: 'testMethod2',
      method: descriptor2.value
    })
  })

  it('should not overwrite existing metadata', () => {
    Reflect.defineMetadata(
      'graphql:queries',
      [{ name: 'existingMethod', method: () => 'existing' }],
      target
    )

    const queryDecorator = Query()
    queryDecorator(target, propertyKey, descriptor)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(2)
    expect(queries[0]).toEqual({
      name: 'existingMethod',
      method: expect.any(Function)
    })
    expect(queries[1]).toEqual({ name: propertyKey, method: descriptor.value })
  })

  it('should handle empty metadata', () => {
    const queryDecorator = Query()
    queryDecorator(target, propertyKey, descriptor)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(1)
    expect(queries[0]).toEqual({ name: propertyKey, method: descriptor.value })
  })

  it('should handle undefined metadata', () => {
    Reflect.defineMetadata('graphql:queries', undefined, target)

    const queryDecorator = Query()
    queryDecorator(target, propertyKey, descriptor)

    const queries = Reflect.getMetadata('graphql:queries', target)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(1)
    expect(queries[0]).toEqual({ name: propertyKey, method: descriptor.value })
  })

  it('should register query in IoC container', async () => {
    @Injectable()
    class TestService {}

    @Resolver()
    class TestResolver {
      @Query()
      testMethod() {
        return 'test'
      }
    }

    @Module({ providers: [TestService], resolvers: [TestResolver] })
    class TestModule {}

    await create(TestModule)

    const resolverInstance = IoCContainer.resolve<TestResolver>(TestResolver)
    const queries = Reflect.getMetadata('graphql:queries', resolverInstance)

    expect(resolverInstance).toBeInstanceOf(TestResolver)
    expect(queries).toBeDefined()
    expect(queries.length).toBe(1)
    expect(queries[0]).toEqual({
      name: 'testMethod',
      method: resolverInstance.testMethod
    })
  })
})
