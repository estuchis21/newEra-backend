import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { LiquidacionProfesorRepository } from './liquidacion-profesor.repository';

@Injectable()
export class LiquidacionProfesorService {
  constructor(
    private readonly liquidacionRepository: LiquidacionProfesorRepository,
  ) {}

  // =====================================================
  // GENERAR LIQUIDACIONES DE UNA CUOTA
  // =====================================================

  async generarPorCuota(idCuota: number) {
    this.validarId(idCuota, 'cuota');

    return this.liquidacionRepository.generarPorCuota(idCuota);
  }

  // =====================================================
  // OBTENER TODAS
  // =====================================================

  async obtenerTodas() {
    return this.liquidacionRepository.obtenerTodas();
  }

  // =====================================================
  // OBTENER POR PROFESOR
  // =====================================================

  async obtenerPorProfesor(idProfesor: number) {
    this.validarId(idProfesor, 'profesor');

    return this.liquidacionRepository.obtenerPorProfesor(idProfesor);
  }

  // =====================================================
  // OBTENER POR CUOTA
  // =====================================================

  async obtenerPorCuota(idCuota: number) {
    this.validarId(idCuota, 'cuota');

    return this.liquidacionRepository.obtenerPorCuota(idCuota);
  }

  // =====================================================
  // OBTENER POR ID
  // =====================================================

  async obtenerPorId(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.liquidacionRepository.obtenerPorId(idLiquidacion);

    if (!liquidacion) {
      throw new NotFoundException(
        `No se encontró la liquidación ${idLiquidacion}.`,
      );
    }

    return liquidacion;
  }

  // =====================================================
  // MARCAR COMO PAGADA
  // =====================================================

  async marcarPagada(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.liquidacionRepository.marcarPagada(idLiquidacion);

    if (!liquidacion) {
      throw new BadRequestException(
        'No se pudo marcar la liquidación como pagada. Verificá que exista y que esté pendiente.',
      );
    }

    return {
      success: true,
      mensaje: 'Liquidación marcada como pagada correctamente.',
      liquidacion,
    };
  }

  // =====================================================
  // ANULAR
  // =====================================================

  async anular(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.liquidacionRepository.anular(idLiquidacion);

    if (!liquidacion) {
      throw new BadRequestException(
        'No se pudo anular la liquidación. Verificá que exista y que esté pendiente.',
      );
    }

    return {
      success: true,
      mensaje: 'Liquidación anulada correctamente.',
      liquidacion,
    };
  }

  // =====================================================
  // RESUMEN
  // =====================================================

  async obtenerResumen() {
    return this.liquidacionRepository.obtenerResumen();
  }

  // =====================================================
  // VALIDACIONES
  // =====================================================

  private validarId(id: number, entidad: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        `El identificador de ${entidad} no es válido.`,
      );
    }
  }
}