import 'reflect-metadata'

export function Mutation(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const mutations = Reflect.getMetadata('graphql:mutations', target) || []

    mutations.push({ name: propertyKey, method: descriptor.value })

    Reflect.defineMetadata('graphql:mutations', mutations, target)
  }
}
