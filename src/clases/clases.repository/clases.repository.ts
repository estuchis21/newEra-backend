import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClasesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async crearClase(idGrupo: number | null, idTipoClase: number, nombre: string, fecha: string, horaInicio: string, horaFin: string) {
    const result = await this.databaseService.query(
      `SELECT crear_clase($1, $2, $3, $4::date, $5::time, $6::time) AS id_clase`,
      [idGrupo, idTipoClase, nombre, fecha, horaInicio, horaFin],
    );
    return result.rows[0];
  }

  async actualizarClase(idClase: number, idGrupo: number | null, idTipoClase: number, nombre: string, fecha: string, horaInicio: string, horaFin: string) {
    await this.databaseService.query(
      `CALL actualizar_clase($1, $2, $3, $4, $5::date, $6::time, $7::time)`,
      [idClase, idGrupo, idTipoClase, nombre, fecha, horaInicio, horaFin],
    );
    return { success: true };
  }

  async cancelarClase(idClase: number) {
    await this.databaseService.query(`CALL cancelar_clase($1)`, [idClase]);
    return { success: true };
  }

  async sesionesPorAlumno(idAlumno: number, desde: string | null = null, hasta: string | null = null) {
    const result = await this.databaseService.query(`SELECT * FROM sesiones_por_alumno($1, $2::date, $3::date)`, [idAlumno, desde, hasta]);
    return result.rows;
  }

  async clasesPorProfesor(idProfesor: number, fecha: string | null = null) {
    const result = await this.databaseService.query(`SELECT * FROM clases_por_profesor($1, $2::date)`, [idProfesor, fecha]);
    return result.rows;
  }
}
