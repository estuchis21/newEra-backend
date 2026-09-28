import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { randomBytes } from 'crypto';

import { MailService } from '../mail/mail.service';

import { AlumnosRepository } from './alumnos.repository/alumnos.repository';

import { CreateAlumnoDto } from './dto/createalumno.dto';
import { LoginDto } from './dto/login.dto';

import * as bcrypt from 'bcrypt';


@Injectable()
export class AlumnosService {

  constructor(
    private readonly alumnosRepository: AlumnosRepository,
    private readonly mailService: MailService,
  ) {}


  // ============================================================
  // REGISTRAR ALUMNO
  // ============================================================

  async RegistrarAlumno(
    dto: CreateAlumnoDto
  ) {

    const saltRounds = 10;

    dto.usuario.contrasena =
      await bcrypt.hash(
        dto.usuario.contrasena,
        saltRounds
      );

    return this.alumnosRepository.createAlumno(dto);
  }


  // ============================================================
  // BUSCAR ALUMNO POR EMAIL
  // ============================================================

  async encontrarAlumnoPorMail(
    email: string
  ) {

    return this.alumnosRepository.findByEmail(
      email
    );
  }


  // ============================================================
  // OBTENER ID ALUMNO POR USUARIO
  // ============================================================

  async obtenerIdAlumnoPorUsuario(
    id_usuario: number
  ) {

    return this.alumnosRepository.obtenerIdAlumnoPorUsuario(
      id_usuario
    );
  }


  // ============================================================
  // LOGIN
  // ============================================================

  async login(
    dto: LoginDto
  ) {

    const usuario =
      await this.alumnosRepository.findByEmail(
        dto.email
      );

    if (!usuario) {

      throw new UnauthorizedException(
        'Email o contraseña incorrectos'
      );

    }


    const passwordValida =
      await bcrypt.compare(
        dto.contrasena,
        usuario.contrasena
      );


    if (!passwordValida) {

      throw new UnauthorizedException(
        'Email o contraseña incorrectos'
      );

    }


    return {

      id_usuario:
        usuario.id_usuario,

      nombre:
        usuario.nombre,

      apellido:
        usuario.apellido,

      email:
        usuario.email,

      id_rol:
        usuario.id_rol,

    };
  }


  // ============================================================
  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ============================================================

  async solicitarRecuperacion(
    email: string,
  ) {

    const usuario =
      await this.alumnosRepository.findByEmail(
        email
      );


    // ==========================================================
    // NO REVELAR SI EL EMAIL EXISTE
    // ==========================================================

    if (!usuario) {

      return {

        message:
          'Si el email está registrado, recibirás un enlace para recuperar tu contraseña.',

      };
    }


    // ==========================================================
    // VERIFICAR QUE TENEMOS ID DE USUARIO
    // ==========================================================

    console.log(
      '================================='
    );

    console.log(
      'USUARIO ENCONTRADO:'
    );

    console.log(
      usuario
    );

    console.log(
      'ID USUARIO:',
      usuario.id_usuario
    );

    console.log(
      'EMAIL:',
      usuario.email
    );

    console.log(
      '================================='
    );


    if (!usuario.id_usuario) {

      throw new BadRequestException(
        'No se pudo obtener el ID del usuario.'
      );

    }


    // ==========================================================
    // GENERAR TOKEN
    // ==========================================================

    const token =
      randomBytes(32).toString('hex');


    // ==========================================================
    // FECHA DE EXPIRACIÓN
    // 30 MINUTOS
    // ==========================================================

    const fechaExpiracion =
      new Date(
        Date.now() +
        30 * 60 * 1000
      );


    // ==========================================================
    // GUARDAR TOKEN EN BASE DE DATOS
    // ==========================================================

    await this.alumnosRepository.crearTokenRecuperacion(

      usuario.id_usuario,

      token,

      fechaExpiracion,

    );


    // ==========================================================
    // ENVIAR EMAIL
    // ==========================================================

    await this.mailService.enviarEmailRecuperacion(

      usuario.email,

      token,

    );


    // ==========================================================
    // RESPUESTA
    // ==========================================================

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


    // ==========================================================
    // BUSCAR TOKEN
    // ==========================================================

    const tokenData =
      await this.alumnosRepository.buscarTokenRecuperacion(
        token
      );


    // ==========================================================
    // TOKEN NO EXISTE
    // ==========================================================

    if (!tokenData) {

      throw new BadRequestException(
        'El enlace de recuperación no es válido.'
      );

    }


    // ==========================================================
    // TOKEN YA UTILIZADO
    // ==========================================================

    if (tokenData.utilizado) {

      throw new BadRequestException(
        'El enlace ya fue utilizado.'
      );

    }


    // ==========================================================
    // TOKEN EXPIRADO
    // ==========================================================

    if (
      new Date() >
      new Date(tokenData.fecha_expiracion)
    ) {

      throw new BadRequestException(
        'El enlace ha expirado.'
      );

    }


    // ==========================================================
    // HASHEAR NUEVA CONTRASEÑA
    // ==========================================================

    const hash =
      await bcrypt.hash(
        nuevaContrasena,
        10
      );


    // ==========================================================
    // CAMBIAR CONTRASEÑA
    // ==========================================================

    await this.alumnosRepository.cambiarContrasena(

      tokenData.id_usuario,

      hash,

    );


    // ==========================================================
    // MARCAR TOKEN COMO UTILIZADO
    // ==========================================================

    await this.alumnosRepository.marcarTokenUtilizado(

      tokenData.id_token

    );


    // ==========================================================
    // RESPUESTA
    // ==========================================================

    return {

      message:
        'Contraseña actualizada correctamente.',

    };
  }

}
