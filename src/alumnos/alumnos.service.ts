
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { MailService } from '../mail/mail.service';
import { AlumnosRepository } from './alumnos.repository/alumnos.repository';

import { CreateAlumnoDto } from './dto/createalumno.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AlumnosService {
  constructor(
    private readonly alumnosRepository: AlumnosRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  // ============================================================
  // REGISTRAR ALUMNO
  // ============================================================

  async RegistrarAlumno(dto: CreateAlumnoDto) {
    const saltRounds = 10;

    dto.usuario.contrasena = await bcrypt.hash(
      dto.usuario.contrasena,
      saltRounds,
    );

    return this.alumnosRepository.createAlumno(dto);
  }

  // ============================================================
  // BUSCAR ALUMNO POR EMAIL
  // ============================================================

  async encontrarAlumnoPorMail(email: string) {
    return this.alumnosRepository.findByEmail(
      email.trim().toLowerCase(),
    );
  }

  // ============================================================
  // OBTENER ID ALUMNO POR USUARIO
  // ============================================================

  async obtenerIdAlumnoPorUsuario(id_usuario: number) {
    return this.alumnosRepository.obtenerIdAlumnoPorUsuario(
      id_usuario,
    );
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const contrasenaIngresada = dto.contrasena;

    if (!email || !contrasenaIngresada) {
      throw new BadRequestException(
        'Faltan el email o la contraseña.',
      );
    }

    // Buscar usuario en PostgreSQL
    const usuario =
      await this.alumnosRepository.findByEmail(email);

    console.log('[LOGIN] Usuario encontrado:', !!usuario);

    if (!usuario) {
      console.log('[LOGIN] Usuario inexistente');

      throw new UnauthorizedException(
        'Email o contraseña incorrectos.',
      );
    }

    // Revisar estructura devuelta por PostgreSQL
    console.log(
      '[LOGIN] Propiedades recibidas:',
      Object.keys(usuario),
    );

    const contrasenaBD =
      usuario.contrasena || usuario.password;

    console.log(
      '[LOGIN] Contraseña recuperada:',
      !!contrasenaBD,
    );

    console.log(
      '[LOGIN] Formato bcrypt:',
      typeof contrasenaBD === 'string' &&
        /^\$2[aby]\$/.test(contrasenaBD),
    );

    if (!contrasenaBD) {
      console.log(
        '[LOGIN] No se encontró el campo de contraseña',
      );

      throw new UnauthorizedException(
        'Email o contraseña incorrectos.',
      );
    }

    // Comparar contraseña ingresada con hash
    const passwordValida = await bcrypt.compare(
      contrasenaIngresada,
      contrasenaBD,
    );

    console.log(
      '[LOGIN] Contraseña válida:',
      passwordValida,
    );

    if (!passwordValida) {
      console.log(
        '[LOGIN] La contraseña no coincide',
      );

      throw new UnauthorizedException(
        'Email o contraseña incorrectos.',
      );
    }

    // Verificar datos necesarios para JWT
    if (!usuario.id_usuario || !usuario.id_rol) {
      console.error(
        '[LOGIN] Faltan id_usuario o id_rol',
      );

      throw new UnauthorizedException(
        'No se pudieron validar los datos del usuario.',
      );
    }

    // Generar JWT
    const payload = {
      sub: usuario.id_usuario,
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
    };

    const access_token =
      await this.jwtService.signAsync(payload);

    console.log('[LOGIN] Autenticación exitosa');

    return {
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        id_rol: usuario.id_rol,
      },
      access_token,
    };
  }

  // ============================================================
  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ============================================================

  async solicitarRecuperacion(email: string) {
    if (!email) {
      throw new BadRequestException(
        'El email es obligatorio.',
      );
    }

    const usuario =
      await this.alumnosRepository.findByEmail(
        email.trim().toLowerCase(),
      );

    if (!usuario) {
      return {
        message:
          'Si el email está registrado, recibirás un enlace para recuperar tu contraseña.',
      };
    }

    if (!usuario.id_usuario) {
      throw new BadRequestException(
        'No se pudo obtener el ID del usuario.',
      );
    }

    const token = randomBytes(32).toString('hex');

    const fechaExpiracion = new Date(
      Date.now() + 30 * 60 * 1000,
    );

    await this.alumnosRepository.crearTokenRecuperacion(
      usuario.id_usuario,
      token,
      fechaExpiracion,
    );

    await this.mailService.enviarEmailRecuperacion(
      usuario.email,
      token,
    );

    return {
      message:
        'Si el email está registrado, recibirás un enlace para recuperar tu contraseña.',
    };
  }

  // ============================================================
  // RESTABLECER CONTRASEÑA
  // ============================================================

  async restablecerContrasena(
    token: string,
    nuevaContrasena: string,
  ) {
    if (!token || !nuevaContrasena) {
      throw new BadRequestException(
        'Faltan el token o la nueva contraseña.',
      );
    }

    if (nuevaContrasena.length < 6) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 6 caracteres.',
      );
    }

    const tokenData =
      await this.alumnosRepository.buscarTokenRecuperacion(
        token,
      );

    if (!tokenData) {
      throw new BadRequestException(
        'El enlace de recuperación no es válido.',
      );
    }

    if (tokenData.utilizado) {
      throw new BadRequestException(
        'El enlace ya fue utilizado.',
      );
    }

    if (
      new Date() >
      new Date(tokenData.fecha_expiracion)
    ) {
      throw new BadRequestException(
        'El enlace ha expirado.',
      );
    }

    const hash = await bcrypt.hash(
      nuevaContrasena,
      10,
    );

    await this.alumnosRepository.cambiarContrasena(
      tokenData.id_usuario,
      hash,
    );

    await this.alumnosRepository.marcarTokenUtilizado(
      tokenData.id_token,
    );

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }
}
