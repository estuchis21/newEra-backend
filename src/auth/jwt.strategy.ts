
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  id_usuario: number;
  id_rol: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    configService: ConfigService,
  ) {
    const secret = configService.get<string>(
      'JWT_SECRET',
    );

    if (!secret) {
      throw new Error(
        'JWT_SECRET no está configurado.',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (
      !payload ||
      !payload.id_usuario ||
      !payload.id_rol
    ) {
      throw new UnauthorizedException(
        'Token inválido.',
      );
    }

    return {
      id_usuario: payload.id_usuario,
      id_rol: payload.id_rol,
    };
  }
}
