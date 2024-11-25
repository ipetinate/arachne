[![Build CI](https://github.com/ipetinate/spider-web/actions/workflows/node.js.yml/badge.svg)](https://github.com/ipetinate/spider-web/actions/workflows/node.js.yml) [![Coverage Status](https://coveralls.io/repos/github/ipetinate/arachne/badge.svg?branch=main)](https://coveralls.io/github/ipetinate/arachne?branch=main)

# Arachne

> A web framework to create GraphQL APIs with Fastify and Mercurius, in a modular and way, with IoC and DI containers to resolve dependencies.

> 🏗️ STILL UNDER DEVELOPMENT 🚧

## About

Arachne is designed to simplify the creation of GraphQL APIs by leveraging the power of Fastify and Mercurius. It promotes a modular architecture, making it easier to manage and scale your application. With built-in Inversion of Control (IoC) and Dependency Injection (DI) containers, Arachne ensures that your dependencies are resolved efficiently and cleanly, leading to more maintainable and testable code. Whether you're building a small project or a large-scale application, Arachne provides the tools and structure needed to develop robust and performant GraphQL APIs.

## How to use

### Installation

1. Install `@arachne/core`, `fastify`, `mercurius` and `graphql` packages

```bash
npm i @arachne/core fastify mercurius graphql
```

### Usage

1. **Create Modules**: Define your modules with services and resolvers.

```typescript
// auth.module.ts
import { Injectable, Query, Mutation, Resolver, Module } from '@arachne/core'

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
  schema: `
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
import { Module } from '@arachne/core'

import { AuthModule } from '@/modules/auth/auth.module'
import { UsersModule } from '@/modules/users/users.module'

@Module({
  imports: [UsersModule, AuthModule]
})
export class AppModule {}
```

3. **Start the Application**: Initialize and start your Fastify server with the application module.

```typescript
// index.ts
import Fastify from 'fastify'
import mercurius, { MercuriusOptions } from 'mercurius'

import { createApp } from '@arachne/core'

import { AppModule } from '@/app/app.module'

async function startupServer() {
  const fastify = Fastify()

  const app = await createApp(AppModule)

  app.setServer(fastify)

  app.use(async ({ server, graphqlContext }) => {
    server.register(mercurius, {
      ...graphqlContext,
      graphiql: true,
      path: '/api/graphql', // To access http://localhost:5000/api/graphql to consume data
      allowBatchedQueries: true
    } as MercuriusOptions)
  })

  await app.listen(5000)
}

startupServer()
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
   http://localhost:PORT/graphiql # or path passed on mercurius config
   ```
   Replace `PORT` with the actual port number your server is configured to use.
