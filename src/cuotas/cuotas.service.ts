import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { CuotasRepository } from './cuotas.repository/cuotas.repository';

@Injectable()
export class CuotasService {
  private readonly logger =
    new Logger(CuotasService.name);

  constructor(
    private readonly cuotasRepository:
      CuotasRepository,
  ) {}

  // ============================================================
  // CREAR CUOTA
  // ============================================================

  async crearCuota(
    idAlumno: number,
    idPaquete: number,
  ) {
    if (
      !Number.isInteger(idAlumno) ||
      idAlumno <= 0
    ) {
      throw new BadRequestException(
        'El ID del alumno no es válido',
      );
    }

    if (
      !Number.isInteger(idPaquete) ||
      idPaquete <= 0
    ) {
      throw new BadRequestException(
        'El ID del paquete no es válido',
      );
    }

    return await this.cuotasRepository.crearCuota(
      idAlumno,
      idPaquete,
    );
  }

  // ============================================================
  // GENERAR CUOTAS AUTOMÁTICAMENTE
  // ============================================================

  @Cron('0 0 1 * *')
  async generarCuotasAutomaticamente() {
    this.logger.log(
      'Generando cuotas mensuales...',
    );

    try {
      await this.cuotasRepository.generarCuotasMes();

      this.logger.log(
        'Cuotas mensuales generadas correctamente',
      );
    } catch (error) {
      this.logger.error(
        'Error generando cuotas mensuales',
        error,
      );
    }
  }

  // ============================================================
  // OBTENER CUOTAS DE UN ALUMNO
  // ============================================================

  async obtenerCuotasAlumno(
    idAlumno: number,
  ) {
    if (
      !Number.isInteger(idAlumno) ||
      idAlumno <= 0
    ) {
      throw new BadRequestException(
        'El ID del alumno no es válido',
      );
    }

    return await this.cuotasRepository
      .obtenerCuotasAlumno(idAlumno);
  }
}