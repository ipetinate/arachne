import 'reflect-metadata'

import { createApp, IoCContainer } from '@/container'
import { Injectable, Module, Resolver } from '@/decorators'

describe('Module Decorator', () => {
  it('should define module options metadata on the target', () => {
    const options = { providers: [], resolvers: [] }

    @Module(options)
    class TestModule {}

    const metadata = Reflect.getMetadata('module:options', TestModule)
    expect(metadata).toEqual(options)
  })

  it('should define metadata for providers', () => {
    class Provider1 {}
    class Provider2 {}
    const options = { providers: [Provider1, Provider2], resolvers: [] }

    @Module(options)
    class TestModule {}

    options.providers.forEach((provider) => {
      const serviceKey = Reflect.getMetadata('serviceKey', provider)
      const serviceScope = Reflect.getMetadata('serviceScope', provider)
      expect(typeof serviceKey).toBe('symbol')
      expect(serviceScope).toBe('singleton')
    })
  })

  it('should define metadata for resolvers', () => {
    class Resolver1 {}
    class Resolver2 {}
    const options = { providers: [], resolvers: [Resolver1, Resolver2] }

    @Module(options)
    class TestModule {}

    options.resolvers.forEach((resolver) => {
      const resolverKey = Reflect.getMetadata('resolverKey', resolver)
      expect(typeof resolverKey).toBe('symbol')
    })
  })

  it('should handle empty options', () => {
    const options = {}

    @Module(options as any)
    class TestModule {}

    const metadata = Reflect.getMetadata('module:options', TestModule)
    expect(metadata).toEqual(options)
  })

  it('should handle undefined providers and resolvers', () => {
    const options = { providers: undefined, resolvers: undefined }

    @Module(options as any)
    class TestModule {}

    const metadata = Reflect.getMetadata('module:options', TestModule)
    expect(metadata).toEqual(options)
  })

  it('should not define metadata for providers if none are provided', () => {
    const options = { providers: [], resolvers: [] }

    @Module(options)
    class TestModule {}

    const providerMetadata = Reflect.getMetadata('serviceKey', TestModule)
    expect(providerMetadata).toBeUndefined()
  })

  it('should not define metadata for resolvers if none are provided', () => {
    const options = { providers: [], resolvers: [] }

    @Module(options)
    class TestModule {}

    const resolverMetadata = Reflect.getMetadata('resolverKey', TestModule)
    expect(resolverMetadata).toBeUndefined()
  })

  it('should allow custom metadata keys for providers', () => {
    class Provider1 {}
    const options = { providers: [Provider1], resolvers: [] }

    @Module(options)
    class TestModule {}

    const customKey = Reflect.getMetadata('serviceKey', Provider1)
    expect(typeof customKey).toBe('symbol')
  })

  it('should allow custom metadata keys for resolvers', () => {
    class Resolver1 {}
    const options = { providers: [], resolvers: [Resolver1] }

    @Module(options)
    class TestModule {}

    const customKey = Reflect.getMetadata('resolverKey', Resolver1)
    expect(typeof customKey).toBe('symbol')
  })

  it('register a module properly on container', async () => {
    @Injectable()
    class TestProvider {}

    @Resolver()
    class TestResolver {}

    @Module({ providers: [TestProvider], resolvers: [TestResolver] })
    class TestModule {}

    await createApp(TestModule)

    const provider = IoCContainer.resolve(TestProvider)
    const resolver = IoCContainer.resolve(TestResolver)

    expect(provider).toBeInstanceOf(TestProvider)
    expect(resolver).toBeInstanceOf(TestResolver)
  })
})
