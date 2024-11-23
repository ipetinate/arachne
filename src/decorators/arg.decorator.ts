import 'reflect-metadata'

export function Args(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata('args', true, target, propertyKey)
  }
}
