import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthApiService } from 'src/features/auth/services/auth-api.service';
import { HttpAuthGuard } from 'src/features/auth/guards/http-auth.guard';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { IAuthUser } from 'src/features/auth/types';
import { ApiCommonErrors } from '../shared/decorators/api-common.decorators';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authApi: AuthApiService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Returns JWT access token' })
  @ApiCommonErrors()
  async login(@Body() body: LoginDto) {
    return this.authApi.login({ email: body.email, password: body.password });
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User created' })
  @ApiCommonErrors()
  async signUp(@Body() body: SignUpDto) {
    return this.authApi.signUp({
      email: body.email,
      username: body.username,
      password: body.password,
    });
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(HttpAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiOkResponse({ description: 'Current user data' })
  @ApiCommonErrors()
  async me(@CurrentUser() user: IAuthUser) {
    return this.authApi.getMe(user.userId);
  }
}
