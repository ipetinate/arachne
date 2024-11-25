import { AppBuilder } from '@/container'
import { ModuleMetadata, ServiceScope } from '@/models'

export class Container {
  private graphQLResolvers: any[] = []
  private graphQLSchema: string = ''
  private services = new Map<
    symbol,
    { scope: ServiceScope; implementation: any }
  >()

  private singletons = new Map<symbol, any>()

  register(target: any, scope: ServiceScope = 'singleton'): void {
    const key = Reflect.getMetadata('serviceKey', target)

    if (!key) throw new Error(`Missing serviceKey metadata for ${target.name}`)

    this.services.set(key, { scope, implementation: target })
  }

  resolve<T>(target: any): T {
    const key = Reflect.getMetadata('serviceKey', target)

    if (!key) throw new Error(`Missing serviceKey metadata for ${target.name}`)

    const serviceEntry = this.services?.get(key)

    if (!serviceEntry)
      throw new Error(`Service not found for key: ${String(key)}`)

    if (serviceEntry?.scope === 'singleton') {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, this.instantiate(serviceEntry?.implementation))
      }

      return this.singletons.get(key) as T
    }

    return this.instantiate(serviceEntry?.implementation)
  }

  private instantiate<T>(target: any): T {
    const paramTypes: any[] =
      Reflect.getMetadata('design:paramtypes', target) || []
    const dependencies = paramTypes.map((param) => this.resolve(param))
    return new target(...dependencies)
  }

  loadModule(moduleClass: any): void {
    const options: ModuleMetadata = Reflect.getMetadata(
      'module:options',
      moduleClass
    )

    if (!options)
      throw new Error(`Module metadata not found for ${moduleClass.name}`)

    options.providers?.forEach((provider: any) => {
      const key =
        Reflect.getMetadata('serviceKey', provider) || Symbol(provider.name)

      // Registrar todos os providers no container antes de coletar os resolvers
      if (!this.services.has(key)) {
        const scope =
          Reflect.getMetadata('serviceScope', provider) || 'singleton'
        this.register(provider, scope)
      }
    })

    options.imports?.forEach((importedModule: any) => {
      this.loadModule(importedModule)

      if (importedModule.schema) {
        this.graphQLSchema += '\n' + importedModule.schema
      }

      if (importedModule.resolvers) {
        importedModule.resolvers.forEach((resolver: any) => {
          const instance = this.resolve(resolver)
          const resolverObj = this.buildResolvers(instance)

          this.graphQLResolvers.push(resolverObj)
        })
      }
    })

    // Agora garantimos que os resolvers do próprio módulo sejam registrados
    if (options.resolvers) {
      options.resolvers.forEach((resolver: any) => {
        const instance = this.resolve(resolver)
        const resolverObj = this.buildResolvers(instance)

        this.graphQLResolvers.push(resolverObj)
      })
    }

    if (options.schema) {
      this.graphQLSchema += '\n' + options.schema
    }
  }

  private buildResolvers(resolverInstance: any) {
    const mutationResolvers =
      Reflect.getMetadata('graphql:mutations', resolverInstance) || []

    const resolvers: any = { Mutation: {} }

    mutationResolvers.forEach((mutation: any) => {
      resolvers.Mutation[mutation.name] = async (...args: any[]) => {
        const hasArgsDecorator = Reflect.getMetadata(
          'args',
          resolverInstance,
          mutation.name
        )

        if (hasArgsDecorator) {
          const [_, argsData] = args
          return mutation.method.apply(resolverInstance, [argsData])
        }

        // Caso não tenha o decorator, passa os parâmetros normalmente
        return mutation.method.apply(resolverInstance, args)
      }
    })

    return resolvers
  }

  collectGraphQL() {
    if (!this.graphQLSchema.trim()) {
      throw new Error("GraphQL Schema is empty. Check your modules' schema.")
    }

    return {
      resolvers: this.graphQLResolvers.reduce(
        (acc, curr) => ({
          Query: { ...acc.Query, ...curr.Query },
          Mutation: { ...acc.Mutation, ...curr.Mutation }
        }),
        { Query: {}, Mutation: {} }
      ),
      schema: this.graphQLSchema.trim()
    }
  }
}

export const IoCContainer = new Container()

export async function create(moduleClass: any): Promise<AppBuilder> {
  IoCContainer.loadModule(moduleClass)

  return new AppBuilder(IoCContainer)
}
