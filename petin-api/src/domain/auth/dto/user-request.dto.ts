import { UserJwtDto } from './user-jwt.dto';

export type UserRequest = {
  user: UserJwtDto;
} & Request;
