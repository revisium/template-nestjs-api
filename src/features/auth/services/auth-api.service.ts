import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandReturnType } from '../commands/impl/login.command';
import { SignUpCommand, SignUpCommandReturnType } from '../commands/impl/sign-up.command';
import { GetMeQuery, GetMeQueryReturnType } from '../queries/impl/get-me.query';

@Injectable()
export class AuthApiService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async login(data: { email: string; password: string }) {
    return this.commandBus.execute<LoginCommand, LoginCommandReturnType>(new LoginCommand(data));
  }

  async signUp(data: { email: string; username: string; password: string }) {
    return this.commandBus.execute<SignUpCommand, SignUpCommandReturnType>(new SignUpCommand(data));
  }

  async getMe(userId: string) {
    return this.queryBus.execute<GetMeQuery, GetMeQueryReturnType>(new GetMeQuery({ userId }));
  }
}
