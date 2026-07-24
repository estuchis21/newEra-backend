import {
  ConflictException,
  Injectable
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { CreateAlumnoDto } from '../dto/createalumno.dto';
import { LoginDto } from '../dto/login.dto';


@Injectable()
export class AlumnosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async createAlumno(
    dto: CreateAlumnoDto,
  ) {

    // VALIDAR EMAIL

    const existe_mail = await this.databaseService.query(
      `
      SELECT findByEmail($1)
      `,
      [
        dto.usuario.email
      ]
    );

    if(existe_mail.rows[0].findbyemail) {

      throw new ConflictException(
        'El correo electrónico ya está registrado'
      );

    }
    // VALIDAR DNI

    const existe_dni = await this.databaseService.query(
      `
      SELECT findByDni($1)
      `,
      [
        dto.usuario.dni
      ]
    );

    if(existe_dni.rows[0].findbydni) {

      throw new ConflictException(
        'El DNI ya está registrado'
      );

    }
    // SOLO ALUMNOS TIENEN es_menor

    const esMenor =
      dto.usuario.id_rol === 1
        ? dto.es_menor
        : null;

    try {
      const resultado =
        await this.databaseService.query(
          `
          CALL RegistroAlumno(

            ROW(
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8
            )::alumno_input,


            ROW(
              NULL,
              $9
            )::alumnos_type,


            ROW(
              NULL
            )::profesorestype,


            NULL

          )
          `,
          [
            // alumno_input
            dto.usuario.nombre,
            dto.usuario.apellido,
            dto.usuario.dni,
            dto.usuario.email,
            dto.usuario.contrasena,
            dto.usuario.username,
            dto.usuario.celular,
            dto.usuario.id_rol,
            // alumnos_type
            esMenor

          ],
        );
      return resultado;

    } catch(error) {

      // DUPLICADOS DE POSTGRES

      if(error.code === '23505') {
        switch(error.constraint) {
          case 'users_username_key':

            throw new ConflictException(
              'El username ya está registrado'
            );
          case 'users_email_key':

            throw new ConflictException(
              'El correo electrónico ya está registrado'
            );
          case 'users_dni_key':

            throw new ConflictException(
              'El DNI ya está registrado'
            );

          default:

            throw new ConflictException(
              'El dato ingresado ya existe'
            );
        }
      }
      throw error;

    }
  }

async findByEmail(dto: LoginDto){

  const result = await this.databaseService.query(
    `
      SELECT * FROM findByEmail($1)
    `,
    [
      dto.email
    ]
  );


  if(result.rows.length === 0){
    throw new Error('Usuario no encontrado');
  }


  return result.rows[0];

}
}