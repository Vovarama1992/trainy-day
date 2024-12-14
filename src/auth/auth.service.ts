import {
  Injectable,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async createAccessToken(user: AuthDto): Promise<string> {
    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'my_jwt_secret';
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: '1h',
    });
    this.logger.log(`Access token created for user ${user.id}`);
    this.logger.debug(`Access token: ${token}`);
    return token;
  }

  async createRefreshToken(user: User): Promise<string> {
    const refreshTokenSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      'my_refresh_token_secret';

    const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, {
      expiresIn: '7d',
    });
    this.logger.log(`Refresh token created for user ${user.id}`);
    this.logger.debug(`Refresh token: ${refreshToken}`);
    return refreshToken;
  }

  async validateRefreshToken(refreshToken: string): Promise<AuthDto> {
    this.logger.log(`Validating refresh token: ${refreshToken}`);
    try {
      const refreshTokenSecret =
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        'my_refresh_token_secret';
      const decoded = jwt.verify(refreshToken, refreshTokenSecret) as {
        id: number;
      };
      this.logger.log(`Refresh token valid for user ID: ${decoded.id}`);
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        this.logger.warn(`User not found for ID: ${decoded.id}`);
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Refresh token validation error: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async processRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      this.logger.log(`Processing refresh token: ${refreshToken}`);
      const user = await this.validateRefreshToken(refreshToken);
      if (!user) {
        this.logger.warn('User not found after refresh token validation');
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const newAccessToken = await this.createAccessToken(user);
      this.logger.log(`New access token generated for user ${user.id}`);
      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.error(
        `Error during refresh token process: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
