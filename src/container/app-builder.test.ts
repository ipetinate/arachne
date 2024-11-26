import { AppBuilder } from './app-builder'
import { Container } from './container'
import { Middleware } from '../models/app-builder'

describe('AppBuilder', () => {
  let container: Container
  let appBuilder: AppBuilder

  beforeEach(() => {
    container = {
      collectGraphQL: vi.fn().mockReturnValue({})
    } as unknown as Container

    appBuilder = new AppBuilder(container)
  })

  it('should add middleware using use()', () => {
    const middleware: Middleware = vi.fn()
    appBuilder.use(middleware)
    expect(appBuilder['middlewares']).toContain(middleware)
  })

  it('should set server using setServer()', () => {
    const server = {}

    appBuilder.setServer(server)

    expect(appBuilder['server']).toBe(server)
  })

  it('should throw error if server is not set when calling listen()', async () => {
    await expect(appBuilder.listen()).rejects.toThrow(
      'Fastify instance is not set. Use setServer() to set a server.'
    )
  })

  it('should call middlewares and start server on listen()', async () => {
    const server = {
      listen: vi.fn().mockResolvedValue(undefined)
    }

    const middleware: Middleware = vi.fn().mockResolvedValue(undefined)

    appBuilder.setServer(server)
    appBuilder.use(middleware)

    await appBuilder.listen(3000)

    expect(middleware).toHaveBeenCalledWith({
      server,
      container,
      graphqlContext: {
        schema: '',
        resolvers: []
      }
    })

    expect(server.listen).toHaveBeenCalledWith({ port: 3000 })
  })
})
