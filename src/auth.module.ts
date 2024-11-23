import { Injectable, Mutation, Resolver, Module, Args } from '@/decorators'

type RegisterArgs = {
  user: { name: string }
}

@Injectable()
class AuthService {
  signIn() {
    return true
  }

  signOut() {
    return true
  }

  register(name: string) {
    return { id: 1, name }
  }
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation()
  signIn() {
    return this.authService.signIn()
  }

  @Mutation()
  signOut() {
    return this.authService.signOut()
  }

  @Mutation()
  async register(@Args() args: RegisterArgs) {
    return this.authService.register(args.user.name)
  }
}

@Module({
  schema: `
    type Mutation {
      signIn: Boolean
      signOut: Boolean
      register(user: UserInput): User
    }

    type User {
      id: ID
      name: String
    }
    
    input UserInput {
      name: String
    }
  `,
  providers: [AuthService],
  resolvers: [AuthResolver]
})
export class AuthModule {}
