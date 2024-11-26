import 'reflect-metadata'

import { createApp, IoCContainer } from '../container/container'
import { Injectable } from './injectable.decorator'
import { Mutation } from './mutation.decorator'
import { Resolver } from './resolver.decorator'
import { Module } from './module.decorator'

describe('Mutation Decorator', () => {
  let target: any
  let propertyKey: string | symbol
  let descriptor: PropertyDescriptor

  beforeEach(() => {
    target = {}
    propertyKey = 'testMutation'
    descriptor = {
      value: () => 'test'
    }
  })

  it('should add mutation metadata to the target', () => {
    const mutationDecorator = Mutation()

    mutationDecorator(target, propertyKey, descriptor)

    const mutations = Reflect.getMetadata('graphql:mutations', target)

    expect(mutations).toBeDefined()
    expect(mutations).toHaveLength(1)
    expect(mutations[0]).toEqual({
      name: propertyKey,
      method: descriptor.value
    })
  })

  it('should append to existing mutation metadata', () => {
    Reflect.defineMetadata(
      'graphql:mutations',
      [{ name: 'existingMutation', method: () => 'existing' }],
      target
    )

    const mutationDecorator = Mutation()

    mutationDecorator(target, propertyKey, descriptor)

    const mutations = Reflect.getMetadata('graphql:mutations', target)

    expect(mutations).toBeDefined()
    expect(mutations).toHaveLength(2)
    expect(mutations[1]).toEqual({
      name: propertyKey,
      method: descriptor.value
    })
  })

  it('should register mutation in IoC container', async () => {
    @Injectable()
    class TestService {}

    @Resolver()
    class TestResolver {
      @Mutation()
      testMutation() {
        return 'test'
      }
    }

    @Module({ providers: [TestService], resolvers: [TestResolver] })
    class TestModule {}

    await createApp(TestModule)

    const resolverInstance = IoCContainer.resolve<TestResolver>(TestResolver)
    const mutations = Reflect.getMetadata('graphql:mutations', resolverInstance)

    expect(resolverInstance).toBeInstanceOf(TestResolver)
    expect(mutations).toBeDefined()
    expect(mutations).toHaveLength(1)
    expect(mutations[0]).toEqual({
      name: 'testMutation',
      method: resolverInstance.testMutation
    })
  })
})
