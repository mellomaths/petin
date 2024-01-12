import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../users/password.service';
import { UserJwtDto } from './dto/user-jwt.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.passwordService.checkLoginAttempt(email, password);
  }

  async login(user: UserJwtDto) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      sub: user.id,
      token,
      expiresIn: parseInt(
        this.configService.get<string>('auth.jwt.expirationTime'),
      ),
    };
  }
}
