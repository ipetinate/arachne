import 'reflect-metadata'
import { ModuleMetadata } from '../models/decorators'

export function Module(options: ModuleMetadata): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('module:options', options, target)

    if (options.providers) {
      options.providers.forEach((provider) => {
        const serviceKey = Symbol(provider.name)
        Reflect.defineMetadata('serviceKey', serviceKey, provider)
        Reflect.defineMetadata('serviceScope', 'singleton', provider)
      })
    }

    if (options.resolvers) {
      options.resolvers.forEach((resolver) => {
        const resolverKey = Symbol(resolver.name)
        Reflect.defineMetadata('resolverKey', resolverKey, resolver)
      })
    }
  }
}
