
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LiquidacionProfesorRepository } from './liquidacion-profesor.repository';
import { RegistrarTransferenciaDto } from './dto/liquidacion-profesor.dto';
import { RegistrarCuentaCobroDto } from './dto/registrar-cuenta-cobro.dto';

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

  async guardarCuentaCobro(
    idProfesor: number,
    dto: RegistrarCuentaCobroDto,
  ) {
    this.validarId(idProfesor, 'profesor');

    if (!dto.alias?.trim() && !dto.cbu_cvu?.trim()) {
      throw new BadRequestException(
        'Debe informar un alias o un CBU/CVU.',
      );
    }

    const cuenta = await this.repository.guardarCuentaCobro(
      idProfesor,
      dto,
    );

    if (!cuenta) {
      throw new BadRequestException(
        'No se pudo guardar la cuenta de cobro.',
      );
    }

    return {
      success: true,
      mensaje: 'Cuenta de cobro registrada correctamente.',
      cuenta,
    };
  }

  async obtenerCuentaCobro(idProfesor: number) {
    this.validarId(idProfesor, 'profesor');

    const cuenta =
      await this.repository.obtenerCuentaCobro(idProfesor);

    return {
      success: true,
      cuenta,
    };
  }

  async obtenerHistorialTransferencias(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.repository.obtenerPorId(idLiquidacion);

    if (!liquidacion) {
      throw new NotFoundException('La liquidación no existe.');
    }

    const transferencias =
      await this.repository.obtenerHistorialTransferencias(
        idLiquidacion,
      );

    return {
      success: true,
      cantidad: transferencias.length,
      transferencias,
    };
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

    const item =
      await this.repository.obtenerPorId(idLiquidacion);

    if (!item) {
      throw new NotFoundException(
        `No existe la liquidación ${idLiquidacion}.`,
      );
    }

    return item;
  }

  async marcarPagada(
    idLiquidacion: number,
    dto: RegistrarTransferenciaDto,
  ) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.repository.obtenerPorId(idLiquidacion);

    if (!liquidacion) {
      throw new NotFoundException('La liquidación no existe.');
    }

    if (liquidacion.estado !== 'Pendiente') {
      throw new BadRequestException(
        `No se puede registrar el pago. Estado actual: ${liquidacion.estado}.`,
      );
    }

    const montoEsperado = Number(liquidacion.monto_profesor);
    const montoTransferido = Number(dto.monto_transferido);

    if (
      !Number.isFinite(montoEsperado) ||
      !Number.isFinite(montoTransferido) ||
      Math.round(montoEsperado * 100) !==
        Math.round(montoTransferido * 100)
    ) {
      throw new BadRequestException(
        `El importe debe ser exactamente $${montoEsperado.toFixed(2)}.`,
      );
    }

    if (dto.id_cuenta) {
      const cuenta =
        await this.repository.obtenerCuentaActivaPorProfesor(
          Number(liquidacion.id_profesor),
        );

      if (
        !cuenta ||
        Number(cuenta.id_cuenta) !== Number(dto.id_cuenta)
      ) {
        throw new BadRequestException(
          'La cuenta seleccionada no pertenece al profesor o está inactiva.',
        );
      }
    }

    const resultado = await this.repository.marcarPagada(
      idLiquidacion,
      dto,
    );

    if (!resultado) {
      throw new BadRequestException(
        'No se pudo registrar el pago. La liquidación pudo haber sido pagada por otra operación o sus datos cambiaron.',
      );
    }

    return {
      success: true,
      mensaje: 'Transferencia registrada correctamente.',
      liquidacion: resultado,
    };
  }

  async anular(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const item = await this.repository.anular(idLiquidacion);

    if (!item) {
      throw new BadRequestException(
        'No se pudo anular: verificá que exista y esté pendiente.',
      );
    }

    return {
      success: true,
      mensaje: 'Liquidación anulada.',
      liquidacion: item,
    };
  }

  async obtenerResumen() {
    return this.repository.obtenerResumen();
  }

  private validarId(id: number, entidad: string) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException(
        `El identificador de ${entidad} no es válido.`,
      );
    }
  }
}
