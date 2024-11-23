export type ServiceScope = 'singleton' | 'transient'

export interface DecoratorProperties {
  scope?: ServiceScope
}

export interface ModuleMetadata {
  providers?: any[]
  imports?: any[]
  resolvers?: any[]
  schema?: string
}
