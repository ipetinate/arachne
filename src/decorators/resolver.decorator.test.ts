import { Resolver } from '@/decorators'
import { IoCContainer } from '@/container'
import { ServiceScope } from '@/models'

describe('Resolver Decorator', () => {
  it('should define metadata and register the target in IoCContainer', () => {
    const mockTarget = class TestService {}
    const mockScope: ServiceScope = 'singleton'
    const mockDecoratorProperties = { scope: mockScope }

    const defineMetadataSpy = vi.spyOn(Reflect, 'defineMetadata')
    const registerSpy = vi.spyOn(IoCContainer, 'register')

    Resolver(mockDecoratorProperties)(mockTarget)

    const serviceKey = Reflect.getMetadata('serviceKey', mockTarget)
    expect(typeof serviceKey).toBe('symbol')
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceKey',
      serviceKey,
      mockTarget
    )
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceScope',
      mockScope,
      mockTarget
    )
    expect(registerSpy).toHaveBeenCalledWith(mockTarget, mockScope)

    defineMetadataSpy.mockRestore()
    registerSpy.mockRestore()
  })

  it('should use default scope if none is provided', () => {
    const mockTarget = class TestService {}

    const defineMetadataSpy = vi.spyOn(Reflect, 'defineMetadata')
    const registerSpy = vi.spyOn(IoCContainer, 'register')

    Resolver()(mockTarget)

    const serviceKey = Reflect.getMetadata('serviceKey', mockTarget)
    const defaultScope = 'singleton'
    expect(typeof serviceKey).toBe('symbol')
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceKey',
      serviceKey,
      mockTarget
    )
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceScope',
      defaultScope,
      mockTarget
    )
    expect(registerSpy).toHaveBeenCalledWith(mockTarget, defaultScope)

    defineMetadataSpy.mockRestore()
    registerSpy.mockRestore()
  })

  it('should register resolver in IoC container', async () => {
    @Resolver()
    class TestResolver {}

    const resolverInstance = IoCContainer.resolve<TestResolver>(TestResolver)

    expect(resolverInstance).toBeInstanceOf(TestResolver)
  })

  it('should handle custom scope', () => {
    const mockTarget = class TestService {}
    const customScope: ServiceScope = 'transient'

    const defineMetadataSpy = vi.spyOn(Reflect, 'defineMetadata')
    const registerSpy = vi.spyOn(IoCContainer, 'register')

    Resolver({ scope: customScope })(mockTarget)

    const serviceKey = Reflect.getMetadata('serviceKey', mockTarget)
    expect(typeof serviceKey).toBe('symbol')
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceKey',
      serviceKey,
      mockTarget
    )
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      'serviceScope',
      customScope,
      mockTarget
    )
    expect(registerSpy).toHaveBeenCalledWith(mockTarget, customScope)

    defineMetadataSpy.mockRestore()
    registerSpy.mockRestore()
  })
})
