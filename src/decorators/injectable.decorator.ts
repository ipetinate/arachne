import 'reflect-metadata'

import { DecoratorProperties } from '@/models/decorators'

export function Injectable(
  { scope }: DecoratorProperties = { scope: 'singleton' }
): ClassDecorator {
  return (target) => {
    const serviceKey = Symbol(target.name)

    Reflect.defineMetadata('serviceKey', serviceKey, target)
    Reflect.defineMetadata('serviceScope', scope, target)
  }
}
