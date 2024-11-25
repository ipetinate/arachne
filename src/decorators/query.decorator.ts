import 'reflect-metadata'

export function Query(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const queries = Reflect.getMetadata('graphql:queries', target) || []

    queries.push({ name: propertyKey, method: descriptor.value })

    Reflect.defineMetadata('graphql:queries', queries, target)
  }
}
