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
  // REGISTRAR ALUMNO
  // ============================================================

  async createAlumno(
    dto: CreateAlumnoDto,
  ) {

    // ==========================================================
    // VALIDAR EMAIL
    // ==========================================================

    const existe_mail =
      await this.databaseService.query(
        `
        SELECT findByEmail($1)
        `,
        [
          dto.usuario.email,
        ],
      );

    if (
      existe_mail.rows[0]?.findbyemail
    ) {

      throw new ConflictException(
        'El correo electrónico ya está registrado',
      );

    }

    // ==========================================================
    // VALIDAR DNI
    // ==========================================================

    const existe_dni =
      await this.databaseService.query(
        `
        SELECT findByDni($1)
        `,
        [
          dto.usuario.dni,
        ],
      );

    if (
      existe_dni.rows[0]?.findbydni
    ) {

      throw new ConflictException(
        'El DNI ya está registrado',
      );

    }

    // ==========================================================
    // SOLO LOS ALUMNOS TIENEN es_menor
    // ==========================================================

    const esMenor =
      dto.usuario.id_rol === 1
        ? dto.es_menor
        : null;

    try {

      // ========================================================
      // REGISTRO ALUMNO
      //
      // SP:
      //
      // registroalumno(
      //   p_alumno alumno_input,
      //   p_alumnos alumnos_type,
      //   p_profesor profesorestype,
      //   INOUT p_id_usuario integer
      // )
      // ========================================================

      const resultado =
        await this.databaseService.query(
          `
          CALL public.registroalumno(

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

            // ==================================================
            // alumno_input
            // ==================================================

            dto.usuario.nombre,
            dto.usuario.apellido,
            dto.usuario.dni,
            dto.usuario.email,
            dto.usuario.contrasena,
            dto.usuario.username,
            dto.usuario.celular,
            dto.usuario.id_rol,

            // ==================================================
            // alumnos_type
            // ==================================================

            esMenor,

          ],
        );

      return resultado;

    } catch (error: any) {

      // ========================================================
      // DUPLICADOS DE POSTGRES
      // ========================================================

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

  async findByEmail(
    email: string,
  ) {

    const resultado =
      await this.databaseService.query(
        `
        SELECT *
        FROM public.buscar_usuario($1)
        `,
        [
          email,
        ],
      );

    if (
      !resultado.rows ||
      resultado.rows.length === 0
    ) {
      return null;
    }

    return resultado.rows[0];
  }



  // ============================================================
  // OBTENER ID DEL ALUMNO A PARTIR DEL ID DEL USUARIO
  // ============================================================

  async obtenerIdAlumnoPorUsuario(
    id_usuario: number,
  ) {

    const resultado =
      await this.databaseService.query(
        `
        SELECT obtener_id_alumno_por_usuario($1::integer) AS id_alumno
        `,
        [
          id_usuario,
        ],
      );

    return resultado.rows[0]?.id_alumno ?? null;
  }


  // ============================================================
  // BUSCAR USUARIO
  // ============================================================

  async buscarUsuario(
    id_usuario: number,
  ) {

    const resultado =
      await this.databaseService.query(
        `
        SELECT *
        FROM buscar_usuario($1)
        `,
        [
          id_usuario,
        ],
      );

    return resultado.rows[0] ?? null;
  }


  // ============================================================
  // EXISTE USERNAME
  // ============================================================

  async existeUsername(
    username: string,
  ) {

    const resultado =
      await this.databaseService.query(
        `
        SELECT existeUsername($1) AS existe
        `,
        [
          username,
        ],
      );

    return resultado.rows[0]?.existe ?? false;
  }


  // ============================================================
  // EXISTE DNI
  // ============================================================

  async existeDni(
    dni: string,
  ) {

    const resultado =
      await this.databaseService.query(
        `
        SELECT existeDni($1) AS existe
        `,
        [
          dni,
        ],
      );

    return resultado.rows[0]?.existe ?? false;
  }
}