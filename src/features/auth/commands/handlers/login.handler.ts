import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { getRequiredEnv } from 'src/shared/config/env';
import { LoginCommand, LoginCommandReturnType } from '../impl/login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginCommandReturnType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ data }: LoginCommand): Promise<LoginCommandReturnType> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
    };

    const secret = getRequiredEnv('JWT_SECRET');
    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '24h',
    });

    return { accessToken };
  }
}
