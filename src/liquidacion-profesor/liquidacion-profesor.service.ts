import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LiquidacionProfesorRepository } from './liquidacion-profesor.repository';

export interface RegistrarTransferenciaDto {
  monto_transferido: number;
  fecha_transferencia: string;
  id_operacion_transferencia: string;
  observaciones_transferencia?: string;
}

@Injectable()
export class LiquidacionProfesorService {
  constructor(
    private readonly repository: LiquidacionProfesorRepository,
  ) {}

  async generarPorCuota(idCuota: number) {
    this.validarId(idCuota, 'cuota');
    return this.repository.generarPorCuota(idCuota);
  }

  async obtenerTodas() {
    return this.repository.obtenerTodas();
  }

  async obtenerPorProfesor(idProfesor: number) {
    this.validarId(idProfesor, 'profesor');
    return this.repository.obtenerPorProfesor(idProfesor);
  }

  async obtenerPorCuota(idCuota: number) {
    this.validarId(idCuota, 'cuota');
    return this.repository.obtenerPorCuota(idCuota);
  }

  async obtenerPorId(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');
    const item = await this.repository.obtenerPorId(idLiquidacion);
    if (!item) throw new NotFoundException(`No existe la liquidación ${idLiquidacion}.`);
    return item;
  }

  async marcarPagada(
    idLiquidacion: number,
    dto: RegistrarTransferenciaDto,
  ) {
    this.validarId(idLiquidacion, 'liquidación');

    const monto = Number(dto?.monto_transferido);
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new BadRequestException('El monto transferido debe ser mayor que cero.');
    }

    const fecha = new Date(dto?.fecha_transferencia);
    if (!dto?.fecha_transferencia || Number.isNaN(fecha.getTime())) {
      throw new BadRequestException('La fecha de transferencia no es válida.');
    }

    const operacion = String(dto?.id_operacion_transferencia ?? '').trim();
    if (!operacion) {
      throw new BadRequestException('El ID o número de operación es obligatorio.');
    }

    const liquidacion = await this.repository.obtenerPorId(idLiquidacion);
    if (!liquidacion) throw new NotFoundException('La liquidación no existe.');
    if (String(liquidacion.estado).toLowerCase() !== 'pendiente') {
      throw new BadRequestException('Solo se pueden pagar liquidaciones pendientes.');
    }

    const esperado = Number(liquidacion.monto_profesor);
    if (Math.abs(monto - esperado) > 0.01) {
      throw new BadRequestException(
        `El monto transferido debe coincidir con el importe a liquidar (${esperado}).`,
      );
    }

    const actualizada = await this.repository.marcarPagada(idLiquidacion, {
      monto,
      fecha,
      operacion,
      observaciones: dto.observaciones_transferencia?.trim() || null,
    });

    if (!actualizada) {
      throw new BadRequestException('No se pudo registrar la transferencia.');
    }

    return {
      success: true,
      mensaje: 'Transferencia registrada y liquidación marcada como pagada.',
      liquidacion: actualizada,
    };
  }

  async anular(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');
    const item = await this.repository.anular(idLiquidacion);
    if (!item) {
      throw new BadRequestException('No se pudo anular: verificá que exista y esté pendiente.');
    }
    return { success: true, mensaje: 'Liquidación anulada.', liquidacion: item };
  }

  async obtenerResumen() {
    return this.repository.obtenerResumen();
  }

  private validarId(id: number, entidad: string) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException(`El identificador de ${entidad} no es válido.`);
    }
  }
}
