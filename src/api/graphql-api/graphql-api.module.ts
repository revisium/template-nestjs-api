import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from 'src/features/auth/auth.module';
import { TaskModule } from 'src/features/task/task.module';
import { TaskResolver } from './task/task.resolver';
import { AuthResolver } from './auth/auth.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    AuthModule,
    TaskModule,
  ],
  providers: [TaskResolver, AuthResolver],
})
export class GraphqlApiModule {}
