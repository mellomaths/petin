import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { Like } from '../entities/like.entity';

export class LikeDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  user: UserDto;

  @ApiProperty({ required: true })
  createdAt: string;

  static fromLikeEntity(entity: Like): LikeDto {
    const dto = new LikeDto();
    dto.id = entity.uuid;
    dto.user = UserDto.fromUserEntity(entity.user);
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
