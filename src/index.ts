import Fastify from 'fastify'
import mercurius, { MercuriusOptions } from 'mercurius'

import { create } from '@/container'
import { AppModule } from '@/app.module'

async function startup() {
  const app = await create(AppModule)
  const fastify = Fastify()

  app.setServer(fastify)

  app.use(async ({ server, graphqlContext }) => {
    server.register(mercurius, {
      ...graphqlContext,
      graphiql: true,
      path: '/api/graphql',
      allowBatchedQueries: true
    } as MercuriusOptions)
  })

  await app.listen(5000)
}

startup()
