import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const headers = context.getArgByIndex(0).headers;
    this.logger.debug(
      `Incoming request headers: ${JSON.stringify(headers, null, 2)}`,
    );
    const authHeader = headers['authorization'] || headers.authorization;
    this.logger.debug(`Вот такой мы нашли Authorization header: ${authHeader}`);

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    if (!authHeader) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.debug(`Authorization header: ${authHeader}`);

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException('Token missing', HttpStatus.UNAUTHORIZED);
    }
    const secret = process.env.JWT_SECRET || 'my_jwt_secret';
    try {
      this.jwtService.verify(token, { secret });
      return true;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
