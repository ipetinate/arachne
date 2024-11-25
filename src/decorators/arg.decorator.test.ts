import 'reflect-metadata'

import { Args } from './arg.decorator'

describe('Args Decorator', () => {
  it('should define metadata on the target property', () => {
    class TestClass {
      method(@Args() param: any) {}
    }

    const metadata = Reflect.getMetadata('args', TestClass.prototype, 'method')

    expect(metadata).toBe(true)
  })
})
