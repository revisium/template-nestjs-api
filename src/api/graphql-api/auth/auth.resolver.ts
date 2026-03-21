import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthApiService } from 'src/features/auth/services/auth-api.service';
import { GqlAuthGuard } from 'src/features/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { IAuthUser } from 'src/features/auth/types';
import { LoginResponseModel } from './models/login-response.model';
import { UserModel } from './models/user.model';
import { IdModel } from '../shared/models/id.model';
import { LoginInput } from './inputs/login.input';
import { SignUpInput } from './inputs/sign-up.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authApi: AuthApiService) {}

  @Mutation(() => LoginResponseModel)
  async login(@Args('data') data: LoginInput) {
    return this.authApi.login({ email: data.email, password: data.password });
  }

  @Mutation(() => IdModel)
  async signUp(@Args('data') data: SignUpInput) {
    return this.authApi.signUp({
      email: data.email,
      username: data.username,
      password: data.password,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserModel)
  async me(@CurrentUser() user: IAuthUser) {
    return this.authApi.getMe(user.userId);
  }
}
