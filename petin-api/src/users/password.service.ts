import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { GetUserByEmailService } from './services/get-user-by-email.service';

@Injectable()
export class PasswordService {
  constructor(private readonly getUserByEmailService: GetUserByEmailService) {}

  async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(password, salt);
    return hash;
  }

  comparePassword(password: string, attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, password);
  }

  async checkLoginAttempt(email: string, attempt: string): Promise<UserDto> {
    const user = await this.getUserByEmailService.execute(email);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        messages: [`User '${email}' was not found.`],
      });
    }

    const passwordMatched = await this.comparePassword(user.password, attempt);
    if (!passwordMatched) {
      throw new UnauthorizedException({
        success: false,
        messages: [`Bad password`],
      });
    }

    user.password = undefined;
    return UserDto.fromUserEntity(user);
  }
}
