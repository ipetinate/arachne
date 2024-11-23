import {
  Injectable,
  Query,
  Mutation,
  Resolver,
  Module,
  Args
} from '@/decorators'
import { usersTypeDefs } from '@/users.schema'

@Injectable()
class UserService {
  async getUser(id: number) {
    return { id, name: 'Alice' }
  }

  updateUser() {
    return { id: 1, name: 'Alice Updated' }
  }
}

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query()
  getUser(@Args() { userId }: { userId: number }) {
    return this.userService.getUser(userId)
  }

  @Mutation()
  updateUser() {
    return this.userService.updateUser()
  }
}

@Module({
  schema: usersTypeDefs,
  providers: [UserService],
  resolvers: [UserResolver]
})
export class UsersModule {}
