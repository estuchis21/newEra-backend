
import { Module } from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>(
          'JWT_SECRET',
        );

        if (!secret) {
          throw new Error(
            'JWT_SECRET no está configurado.',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: '8h',
          },
        };
      },
    }),
  ],

  providers: [
    JwtStrategy,
    JwtAuthGuard,
  ],

  exports: [
    JwtModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
