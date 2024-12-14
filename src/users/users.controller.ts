import {
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user data' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Authorization header missing',
      },
    },
  })
  @Get('me')
  async getMe(@Request() req) {
    this.logger.log(
      `Incoming request headers: ${JSON.stringify(req.headers, null, 2)}`,
    );

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.log(`Authorization header found: ${authHeader}`);

    const token = authHeader.split(' ')[1];

    try {
      const user = await this.usersService.getUserFromToken(token);
      this.logger.log(`User retrieved: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`Error retrieving user: ${error.message}`, error.stack);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
