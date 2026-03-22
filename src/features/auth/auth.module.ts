import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { CaslAbilityFactory } from './casl-ability.factory';
import { AuthApiService } from './services/auth-api.service';
import { NoAuthService } from './services/no-auth.service';
import { AUTH_COMMANDS } from './commands/handlers';
import { AUTH_QUERIES } from './queries/handlers';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from './guards/optional-gql-auth.guard';
import { HttpAuthGuard } from './guards/http-auth.guard';
import { OptionalHttpAuthGuard } from './guards/optional-http-auth.guard';

@Module({
  imports: [CqrsModule, DatabaseModule, PassportModule, JwtModule.register({ global: true })],
  providers: [
    JwtStrategy,
    CaslAbilityFactory,
    AuthApiService,
    NoAuthService,
    GqlAuthGuard,
    OptionalGqlAuthGuard,
    HttpAuthGuard,
    OptionalHttpAuthGuard,
    ...AUTH_COMMANDS,
    ...AUTH_QUERIES,
  ],
  exports: [
    AuthApiService,
    CaslAbilityFactory,
    NoAuthService,
    GqlAuthGuard,
    OptionalGqlAuthGuard,
    HttpAuthGuard,
    OptionalHttpAuthGuard,
  ],
})
export class AuthModule {}
