import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
//import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
//import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    JwtModule,
  ],
  /*providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],*/
})
export class AppModule {}
