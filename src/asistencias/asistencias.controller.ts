import { Controller } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

    async verAsistencias(idAlumno: number) {
      return this.asistenciasService.verAsistencias(idAlumno);
    }

    async verAsistenciaAlumnoClase(idAlumno: number, idClase: number) {
      return this.asistenciasService.verAsistenciaAlumnoClase(idAlumno, idClase);
    }

    async registrarAsistencia(
        idAlumno: number,
        idClase: number,
        estado: string,
        observaciones: string,
    ) {
        return this.asistenciasService.registrarAsistencia(
            idAlumno,
            idClase,
            estado,
            observaciones,
        );
    }


}
