import {
  Controller,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserLoginDto } from './dto/user-login.dto';
import { UserJwtDto } from './dto/user-jwt.dto';
import { UserRequest } from './dto/user-request.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully logged in',
    type: UserJwtDto,
  })
  @ApiBody({ type: UserLoginDto })
  async login(@Request() request: UserRequest) {
    return this.authService.login(request.user);
  }
}
