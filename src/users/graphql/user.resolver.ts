import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { User } from './user.model';
import { UsersService } from '../services/users.service';
import { CreateUserInput } from './create-user.input';
import { UseFilters } from '@nestjs/common';
import { GraphQLExceptionFilter } from '../../graphql/graphql-exception.filter';

@Resolver(() => User)
@UseFilters(GraphQLExceptionFilter)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput): Promise<User> {
    return this.usersService.create(data);
  }
}
