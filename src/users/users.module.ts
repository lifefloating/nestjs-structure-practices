import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserResolver } from './graphql/user.resolver';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
