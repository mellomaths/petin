import { UserDto } from '../../src/domain/users/dto/user.dto';
import {
  Intention,
  UserRole,
} from '../../src/domain/users/entities/user.entity';
import { mockUserEntity } from './user.entity.mock';

export const mockUserDto = (userRole: UserRole, intention: Intention) => {
  const entity = mockUserEntity(userRole, intention);
  return UserDto.fromUserEntity(entity);
};
