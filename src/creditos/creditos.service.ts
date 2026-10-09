
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreditosRepository } from './creditos.repository';

@Injectable()
export class CreditosService {
  constructor(
    private readonly creditosRepository: CreditosRepository,
  ) {}

  async obtenerSaldo(idAlumno: number) {
    if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
      throw new BadRequestException(
        'El ID del alumno debe ser un entero positivo.',
      );
    }

    const saldo =
      await this.creditosRepository.saldoPorAlumno(idAlumno);

    if (!saldo || saldo.length === 0) {
      throw new NotFoundException(
        'No se encontraron créditos para este alumno.',
      );
    }

    return {
      idAlumno,
      creditos: saldo,
    };
  }

  async comprarPaquete(
    idAlumno: number,
    idPaquete: number,
  ) {
    if (
      !Number.isInteger(idAlumno) ||
      idAlumno <= 0 ||
      !Number.isInteger(idPaquete) ||
      idPaquete <= 0
    ) {
      throw new BadRequestException(
        'El ID del alumno y el del paquete deben ser enteros positivos.',
      );
    }

    try {
      await this.creditosRepository.comprarPaquete(
        idAlumno,
        idPaquete,
      );

      return {
        mensaje: 'Compra de créditos registrada correctamente.',
        idAlumno,
        idPaquete,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo registrar la compra de créditos.',
      );
    }
  }
}