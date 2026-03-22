import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResponseModel {
  @Field()
  accessToken!: string;
}
