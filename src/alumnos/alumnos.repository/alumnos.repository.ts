
import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

import { CreateAlumnoDto } from '../dto/createalumno.dto';

@Injectable()
export class AlumnosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // CREAR TOKEN DE RECUPERACIÓN
  // ============================================================

  async crearTokenRecuperacion(
    id_usuario: number,
    token: string,
    fechaExpiracion: Date,
  ) {
    await this.databaseService.query(
      `
        INSERT INTO tokens_recuperacion_password
        (
          id_usuario,
          token,
          fecha_expiracion
        )
        VALUES ($1, $2, $3)
      `,
      [
        id_usuario,
        token,
        fechaExpiracion,
      ],
    );
  }

  // ============================================================
  // BUSCAR TOKEN DE RECUPERACIÓN
  // ============================================================

  async buscarTokenRecuperacion(token: string) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT
            id_token,
            id_usuario,
            token,
            fecha_expiracion,
            utilizado
          FROM tokens_recuperacion_password
          WHERE token = $1
        `,
        [token],
      );

    return resultado.rows[0] ?? null;
  }

  // ============================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================

  async cambiarContrasena(
    id_usuario: number,
    contrasena: string,
  ) {
    await this.databaseService.query(
      `
        UPDATE users
        SET contrasena = $1
        WHERE id_usuario = $2
      `,
      [
        contrasena,
        id_usuario,
      ],
    );
  }

  // ============================================================
  // MARCAR TOKEN UTILIZADO
  // ============================================================

  async marcarTokenUtilizado(id_token: number) {
    await this.databaseService.query(
      `
        UPDATE tokens_recuperacion_password
        SET utilizado = TRUE
        WHERE id_token = $1
      `,
      [id_token],
    );
  }

  // ============================================================
  // CREAR USUARIO
  // ============================================================

  async createAlumno(dto: CreateAlumnoDto) {
    // Verificar email
    const existe_mail =
      await this.databaseService.query(
        `
          SELECT findByEmail($1)
        `,
        [dto.usuario.email],
      );

    if (existe_mail.rows[0]?.findbyemail) {
      throw new ConflictException(
        'El correo electrónico ya está registrado',
      );
    }

    // Verificar DNI
    const existe_dni =
      await this.databaseService.query(
        `
          SELECT findByDni($1)
        `,
        [dto.usuario.dni],
      );

    if (existe_dni.rows[0]?.findbydni) {
      throw new ConflictException(
        'El DNI ya está registrado',
      );
    }

    // Determinar si es menor
    const esMenor =
      dto.usuario.id_rol === 2
        ? dto.es_menor
        : null;

    try {
      // Crear usuario y alumno/profesor
      await this.databaseService.query(
        `
          CALL registroalumno(
            ROW(
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8
            )::public.alumno_input,

            ROW(
              NULL,
              $9
            )::public.alumnos_type,

            ROW(
              NULL
            )::public.profesorestype,

            NULL::integer
          )
        `,
        [
          dto.usuario.nombre,
          dto.usuario.apellido,
          dto.usuario.dni,
          dto.usuario.email,
          dto.usuario.contrasena,
          dto.usuario.username,
          dto.usuario.celular,
          dto.usuario.id_rol,
          esMenor,
        ],
      );

      // Obtener usuario creado
      const usuario =
        await this.databaseService.query(
          `
            SELECT
              u.id_usuario,
              u.nombre,
              u.apellido,
              u.dni,
              u.email,
              u.username,
              u.celular,
              u.id_rol
            FROM users u
            WHERE u.email = $1
          `,
          [dto.usuario.email],
        );

      if (usuario.rows.length === 0) {
        throw new Error(
          'El usuario fue creado pero no pudo ser recuperado',
        );
      }

      return usuario.rows[0];

    } catch (error: any) {
      if (error.code === '23505') {
        switch (error.constraint) {
          case 'users_username_key':
            throw new ConflictException(
              'El username ya está registrado',
            );

          case 'users_email_key':
            throw new ConflictException(
              'El correo electrónico ya está registrado',
            );

          case 'users_dni_key':
            throw new ConflictException(
              'El DNI ya está registrado',
            );

          default:
            throw new ConflictException(
              'El dato ingresado ya existe',
            );
        }
      }

      throw error;
    }
  }

  // ============================================================
  // BUSCAR USUARIO POR EMAIL
  // ============================================================

  async findByEmail(email: string) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT *
          FROM public.buscar_usuario($1)
        `,
        [email.trim().toLowerCase()],
      );

    if (
      !resultado.rows ||
      resultado.rows.length === 0
    ) {
      return null;
    }

    const usuario = resultado.rows[0];

    // Diagnóstico sin mostrar datos sensibles
    console.log(
      '[REPOSITORY] Usuario recuperado:',
      !!usuario,
    );

    console.log(
      '[REPOSITORY] Campos devueltos:',
      Object.keys(usuario),
    );

    return usuario;
  }

  // ============================================================
  // OBTENER ID ALUMNO POR USUARIO
  // ============================================================

  async obtenerIdAlumnoPorUsuario(
    id_usuario: number,
  ) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT
            obtener_id_alumno_por_usuario(
              $1::integer
            ) AS id_alumno
        `,
        [id_usuario],
      );

    return resultado.rows[0]?.id_alumno ?? null;
  }

  // ============================================================
  // BUSCAR USUARIO POR ID
  // ============================================================

  async buscarUsuario(id_usuario: number) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT *
          FROM buscar_usuario($1)
        `,
        [id_usuario],
      );

    return resultado.rows[0] ?? null;
  }

  // ============================================================
  // EXISTE USERNAME
  // ============================================================

  async existeUsername(username: string) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT existeUsername($1) AS existe
        `,
        [username],
      );

    return resultado.rows[0]?.existe ?? false;
  }

  // ============================================================
  // EXISTE DNI
  // ============================================================

  async existeDni(dni: string) {
    const resultado =
      await this.databaseService.query(
        `
          SELECT existeDni($1) AS existe
        `,
        [dni],
      );

    return resultado.rows[0]?.existe ?? false;
  }
}
