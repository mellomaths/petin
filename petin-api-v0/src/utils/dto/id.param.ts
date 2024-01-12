import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class IdParam {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
