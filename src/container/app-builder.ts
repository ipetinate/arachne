import { Container } from '@/container'
import { Middleware } from '@/models'

import { mergeSchema } from '@/utils/merge-schema'

export class AppBuilder {
  private middlewares: Middleware[] = []
  private server: any

  constructor(private container: Container) {}

  use(middleware: Middleware): this {
    this.middlewares.push(middleware)

    return this
  }

  setServer(server: any): void {
    this.server = server
  }

  async listen(port: number = 5000): Promise<void> {
    if (!this.server) {
      throw new Error(
        'Fastify instance is not set. Use setServer() to set a server.'
      )
    }

    for (const middleware of this.middlewares) {
      await middleware({
        server: this.server,
        container: this.container,
        graphqlContext: {
          schema: mergeSchema(this.container.collectGraphQL().schema),
          resolvers: this.container.collectGraphQL().resolvers ?? []
        }
      })
    }

    try {
      await this.server.listen({ port })

      console.log(`\n🚀 Server listening on port ${port}`)
      console.log(`💻 GraphQL Playground: http://localhost:${port}/graphiql\n`)
    } catch (error) {
      console.error(error)
    }
  }
}
