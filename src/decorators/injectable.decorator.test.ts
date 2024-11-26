import 'reflect-metadata'

import { Injectable } from './injectable.decorator'
import { Module } from './module.decorator'
import { createApp, IoCContainer } from '../container/container'

describe('Injectable Decorator', () => {
  test('should define metadata for serviceKey and serviceScope', () => {
    @Injectable({ scope: 'singleton' })
    class TestService {}

    const serviceKey = Reflect.getMetadata('serviceKey', TestService)
    const serviceScope = Reflect.getMetadata('serviceScope', TestService)

    expect(typeof serviceKey).toBe('symbol')
    expect(serviceScope).toBe('singleton')
  })

  test('should use default scope if not provided', () => {
    @Injectable()
    class TestService {}

    const serviceScope = Reflect.getMetadata('serviceScope', TestService)

    expect(serviceScope).toBe('singleton')
  })

  test('should allow custom scope', () => {
    @Injectable({ scope: 'transient' })
    class TestService {}

    const serviceScope = Reflect.getMetadata('serviceScope', TestService)

    expect(serviceScope).toBe('transient')
  })

  test('should define unique serviceKey for each service', () => {
    @Injectable()
    class TestService {}

    @Injectable()
    class AnotherService {}

    const serviceKey = Reflect.getMetadata('serviceKey', TestService)
    const anotherServiceKey = Reflect.getMetadata('serviceKey', AnotherService)

    expect(serviceKey).not.toBe(anotherServiceKey)

    expect(typeof serviceKey).toBe('symbol')
    expect(typeof anotherServiceKey).toBe('symbol')

    expect(serviceKey).toBeTruthy()
    expect(anotherServiceKey).toBeTruthy()
  })

  test('should register service in IoC container', async () => {
    @Injectable()
    class TestService {}

    @Module({
      providers: [TestService]
    })
    class AppModule {}

    await createApp(AppModule)

    const serviceInstance = IoCContainer.resolve<TestService>(TestService)

    expect(serviceInstance).toBeInstanceOf(TestService)
  })
})
