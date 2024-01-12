import { ApiProperty } from '@nestjs/swagger';

export class UserJwtDto {
  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: true })
  sub: string;

  @ApiProperty({ required: true })
  token: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: true })
  expiresIn: number;
}
