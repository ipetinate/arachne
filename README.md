[![Build CI](https://github.com/ipetinate/spider-web/actions/workflows/node.js.yml/badge.svg)](https://github.com/ipetinate/spider-web/actions/workflows/node.js.yml)

# Arachne

> A web framework to create GraphQL APIs with Fastify and Mercurius, in a modular and way, with IoC and DI containers to resolve dependencies.

## About

Arachne is designed to simplify the creation of GraphQL APIs by leveraging the power of Fastify and Mercurius. It promotes a modular architecture, making it easier to manage and scale your application. With built-in Inversion of Control (IoC) and Dependency Injection (DI) containers, Arachne ensures that your dependencies are resolved efficiently and cleanly, leading to more maintainable and testable code. Whether you're building a small project or a large-scale application, Arachne provides the tools and structure needed to develop robust and performant GraphQL APIs.

## How to use

### Usage

1. **Create Modules**: Define your modules with services and resolvers.

```typescript
// auth.module.ts
import { Injectable, Query, Mutation, Resolver, Module } from './decorators'

@Injectable()
class AuthService {
  signIn() {
    return true
  }

  signOut() {
    return true
  }

  register() {
    return {
      id: 1,
      name: 'Alice'
    }
  }
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query()
  signIn() {
    return this.authService.signIn()
  }

  @Mutation()
  signOut() {
    return this.authService.signOut()
  }

  @Mutation()
  register() {
    return this.authService.register()
  }
}

@Module({
  schema: gql`
    type Query {
      signIn: Boolean
    }

    type Mutation {
      signOut: Boolean
      register: User
    }

    type User {
      id: ID
      name: String
    }
  `,
  providers: [AuthService],
  resolvers: [AuthResolver]
})
export class AuthModule {}
```

2. **Combine Modules**: Import your modules into the main application module.

```typescript
// app.module.ts
import { Module } from './decorators'
import { AuthModule } from './auth.module'
import { UsersModule } from './user.module'

@Module({
  imports: [UsersModule, AuthModule]
})
export class AppModule {}
```

3. **Start the Application**: Initialize and start your Fastify server with the application module.

```typescript
// index.ts
import Fastify from 'fastify'
import mercurius from 'mercurius'
import { create } from './container'
import { AppModule } from './app.module'

async function startup() {
  const app = await create(AppModule)
  const fastify = Fastify()

  app.setServer(fastify)

  app.use(async ({ server, graphqlContext }) => {
    server.register(mercurius, {
      ...graphqlContext,
      graphiql: true
    })
  })

  app.use(async () => {
    fastify.get('/', async () => {
      return { message: 'Hello from Fastify!' }
    })
  })

  await app.listen(5000)
}

startup()
```

Now you have a running GraphQL API with Fastify and Mercurius using a modular architecture.

## Running app

## Running the Server

1. Ensure you have all the necessary dependencies installed. You can install them using:

   ```bash
   npm install
   ```

2. Start the server by running:

   ```bash
   npm start
   ```

3. Once the server is running, you can access the GraphiQL playground (if enabled) by navigating to:
   ```bash
   http://localhost:PORT/graphiql
   ```
   Replace `PORT` with the actual port number your server is configured to use.
