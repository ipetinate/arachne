import { Container } from '../container/container'

export interface GraphQLContext {
  resolvers: any
  schema: string
}

export interface MiddlewareContext {
  container: Container
  server: any
  graphqlContext: GraphQLContext
}

export type Middleware = (context: MiddlewareContext) => Promise<void> | void
