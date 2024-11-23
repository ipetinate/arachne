import { Module } from '@/decorators'

import { AuthModule } from '@/auth.module'
import { UsersModule } from '@/user.module'

@Module({
  imports: [UsersModule, AuthModule]
})
export class AppModule {}
