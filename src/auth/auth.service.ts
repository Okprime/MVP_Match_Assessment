import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/auth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.validateUser(username, password);

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // decrypt password
    const isMatch = await this.comparePasswords(
      password.toString(),
      user.password.toString(),
    );
    if (isMatch) {
      return user;
    }
    return null;
  }
}
