import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../guards/public.decorator';
import { LoginDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'User registration data',
    type: RegisterDto,
    examples: {
      'application/json': {
        value: {
          email: 'user@example.com',
          name: 'John',
          password: 'Pass123$',
        },
      },
    },
  })
  @Post('register')
  async register(@Body() userDto: RegisterDto) {
    try {
      const user = await this.authService.register(userDto);
      return {
        message: 'User registered successfully',
        user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
    examples: {
      'application/json': {
        value: { email: 'user@example.com', password: 'Pass123$' },
      },
    },
  })
  @Post('login')
  async login(@Body() userDto: LoginDto) {
    const user = await this.authService.validateUser(
      userDto.email,
      userDto.password,
    );
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);

    return { accessToken, refreshToken };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh-token')
  async refreshToken(@Req() request: Request) {
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        'Invalid or missing refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const refreshToken = authHeader.split(' ')[1];
    return this.authService.processRefreshToken(refreshToken);
  }
}
