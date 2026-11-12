
import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { DatabaseService } from '../database/database.service';
import { CuotasRepository } from './cuotas.repository/cuotas.repository';

@Injectable()
export class CuotasService {
  private readonly logger =
    new Logger(CuotasService.name);

  constructor(
    private readonly cuotasRepository: CuotasRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // RECALCULAR CUOTA DE UN ALUMNO
  // ============================================================

  async recalcularCuotaAlumno(idAlumno: number) {
    if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
      throw new BadRequestException(
        'El ID del alumno no es válido.',
      );
    }

    return this.databaseService.transaction(async (client) => {
      return this.cuotasRepository.recalcularCuotaMes(
        client,
        idAlumno,
      );
    });
  }

  // ============================================================
  // CREAR CUOTA
  // ============================================================

  async crearCuota(
    idAlumno: number,
    idPaquete: number,
  ) {
    if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
      throw new BadRequestException(
        'El ID del alumno no es válido',
      );
    }

    if (!Number.isInteger(idPaquete) || idPaquete <= 0) {
      throw new BadRequestException(
        'El ID del paquete no es válido',
      );
    }

    return this.cuotasRepository.crearCuota(
      idAlumno,
      idPaquete,
    );
  }

  // ============================================================
  // GENERAR CUOTAS AUTOMÁTICAMENTE
  // ============================================================

  @Cron('0 0 1 * *')
  async generarCuotasAutomaticamente() {
    this.logger.log('Generando cuotas mensuales...');

    try {
      // Todavía no activar esta generación:
      // debe reemplazarse por la generación individual
      // basada en grupos activos y configuración persistente.

      this.logger.warn(
        'Generación automática pendiente de implementar.',
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

  async obtenerCuotasAlumno(idAlumno: number) {
    if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
      throw new BadRequestException(
        'El ID del alumno no es válido',
      );
    }

    return this.cuotasRepository.obtenerCuotasAlumno(idAlumno);
  }

  // ============================================================
  // VERIFICAR ACCESO
  // ============================================================

  async verificarAccesoAlumno(idAlumno: number) {
    const puedeAcceder =
      await this.cuotasRepository.puedeAccederAlumno(idAlumno);

    if (puedeAcceder) {
      return {
        puedeAcceder: true,
        motivo: null,
        mensaje: null,
      };
    }

    return {
      puedeAcceder: false,
      motivo: 'cuota_pendiente',
      mensaje:
        'Acceso académico restringido. Tenés una cuota pendiente. Podés consultar tus cuotas y realizar el pago desde esta sección.',
    };
  }
}
