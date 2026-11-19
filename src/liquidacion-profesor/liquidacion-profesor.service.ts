
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

    const liquidacion =
      await this.repository.obtenerPorId(idLiquidacion);

    if (!liquidacion) {
      throw new NotFoundException(
        `No existe la liquidación ${idLiquidacion}.`,
      );
    }

    return liquidacion;
  }

  async marcarPagada(
    idLiquidacion: number,
    dto: RegistrarTransferenciaDto,
  ) {
    this.validarId(idLiquidacion, 'liquidación');

    const monto = Number(dto.monto_transferido);

    if (!Number.isFinite(monto) || monto <= 0) {
      throw new BadRequestException(
        'El monto transferido debe ser mayor que cero.',
      );
    }

    const fecha = new Date(dto.fecha_transferencia);

    if (
      !dto.fecha_transferencia ||
      Number.isNaN(fecha.getTime())
    ) {
      throw new BadRequestException(
        'La fecha de transferencia no es válida.',
      );
    }

    if (
      dto.id_cuenta !== undefined &&
      (!Number.isSafeInteger(dto.id_cuenta) || dto.id_cuenta <= 0)
    ) {
      throw new BadRequestException(
        'El identificador de la cuenta no es válido.',
      );
    }

    const liquidacion =
      await this.repository.obtenerPorId(idLiquidacion);

    if (!liquidacion) {
      throw new NotFoundException(
        'La liquidación no existe.',
      );
    }

    if (
      String(liquidacion.estado).trim().toLowerCase() !==
      'pendiente'
    ) {
      throw new BadRequestException(
        'Solo se pueden pagar liquidaciones pendientes.',
      );
    }

    const montoEsperado = Number(liquidacion.monto_profesor);

    if (
      !Number.isFinite(montoEsperado) ||
      Math.abs(monto - montoEsperado) > 0.01
    ) {
      throw new BadRequestException(
        `El monto transferido debe coincidir con el importe a liquidar (${montoEsperado}).`,
      );
    }

    const operacion =
      dto.id_operacion_transferencia?.trim() || undefined;

    const actualizada =
      await this.repository.marcarPagada(idLiquidacion, {
        monto_transferido: monto,
        fecha_transferencia: fecha.toISOString(),
        id_cuenta: dto.id_cuenta,
        id_operacion_transferencia: operacion,
        observaciones_transferencia:
          dto.observaciones_transferencia?.trim() || undefined,
      });

    if (!actualizada) {
      throw new BadRequestException(
        'No se pudo registrar la transferencia. Verificá que la liquidación siga pendiente y que la cuenta pertenezca al profesor.',
      );
    }

    return {
      success: true,
      mensaje:
        'Transferencia registrada y liquidación marcada como pagada.',
      liquidacion: actualizada,
    };
  }

  async anular(idLiquidacion: number) {
    this.validarId(idLiquidacion, 'liquidación');

    const liquidacion =
      await this.repository.anular(idLiquidacion);

    if (!liquidacion) {
      throw new BadRequestException(
        'No se pudo anular: verificá que exista y esté pendiente.',
      );
    }

    return {
      success: true,
      mensaje: 'Liquidación anulada.',
      liquidacion,
    };
  }

  async obtenerResumen() {
    return this.repository.obtenerResumen();
  }

  async obtenerCuentaActivaPorProfesor(idProfesor: number) {
    this.validarId(idProfesor, 'profesor');

    const cuenta =
      await this.repository.obtenerCuentaActivaPorProfesor(
        idProfesor,
      );

    return {
      success: true,
      cuenta,
    };
  }

  async guardarCuentaCobro(
    idProfesor: number,
    dto: RegistrarCuentaCobroDto,
  ) {
    this.validarId(idProfesor, 'profesor');

    const alias = dto.alias?.trim();
    const cbu = dto.cbu_cvu?.trim();

    if (!alias && !cbu) {
      throw new BadRequestException(
        'Debés informar un alias o un CBU/CVU.',
      );
    }

    if (cbu && !/^[0-9]{22}$/.test(cbu)) {
      throw new BadRequestException(
        'El CBU/CVU debe contener exactamente 22 dígitos.',
      );
    }

    if (!dto.titular?.trim()) {
      throw new BadRequestException(
        'El titular de la cuenta es obligatorio.',
      );
    }

    const cuenta = await this.repository.guardarCuentaCobro(
      idProfesor,
      {
        ...dto,
        alias: alias || undefined,
        cbu_cvu: cbu || undefined,
        titular: dto.titular.trim(),
      },
    );

    if (!cuenta) {
      throw new BadRequestException(
        'No se pudo registrar la cuenta de cobro.',
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

  async obtenerHistorialTransferencias(
    idLiquidacion: number,
  ) {
    this.validarId(idLiquidacion, 'liquidación');

    await this.obtenerPorId(idLiquidacion);

    const transferencias =
      await this.repository.obtenerHistorialTransferencias(
        idLiquidacion,
      );

    return {
      success: true,
      transferencias,
    };
  }

  private validarId(id: number, entidad: string) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException(
        `El identificador de ${entidad} no es válido.`,
      );
    }
  }
}
