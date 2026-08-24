import { Injectable } from '@nestjs/common';
import {DatabaseService} from '../../database/database.service';
import {ConflictException} from '@nestjs/common';
@Injectable()
export class AsistenciasRepository {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async verAsistencias(idAlumno: number) {
        const result = await this.databaseService.query(
            `
            SELECT * FROM obtener_asistencia_alumno($1) as asistencia
            `,
            [idAlumno],
        );

        return result;
    }

    async verAsistenciaAlumnoClase (idAlumno: number, idClase: number) {
        const result = await this.databaseService.query(
            `
            SELECT * FROM asistencia_x_alumno_clase($1, $2) as asistencia
            `,
            [idAlumno, idClase],
        );

        return result;
    }

    async registrarAsistencia(
    idAlumno: number,
    idClase: number,
    estado: string,
    observaciones: string,
  ) {

    try {

      await this.databaseService.query(
        `
        CALL anotarasistencia(
          $1,
          $2,
          $3,
          $4
        );
        `,
        [
          idAlumno,
          idClase,
          estado,
          observaciones,
        ],
      );

      return {
        success: true,
        message: 'Asistencia registrada correctamente.',
      };

    } catch (error: any) {

      console.error(
        'Error registrando asistencia:',
        error,
      );

      // ==========================================
      // ASISTENCIA DUPLICADA
      // ==========================================

      if (
        error?.code === '23505' &&
        error?.constraint === 'uq_asistencia_alumno_clase'
      ) {

        throw new ConflictException(
          `El alumno ${idAlumno} ya tiene una asistencia registrada para la clase ${idClase}.`,
        );
      }

      // ==========================================
      // OTROS ERRORES
      // ==========================================

      throw error;
    }
  }
}
