import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { ProfesoresRepository } from './profesores.repository/profesores.repository';

@Injectable()
export class ProfesoresService {
    constructor(
        private readonly profesoresRepository: ProfesoresRepository,
    ) {}

    async obtenerProfesorPorUsuario(idUsuario: number) {
        const profesor =
            await this.profesoresRepository.obtenerProfesorPorUsuario(
                idUsuario,
            );

        if (!profesor) {
            throw new NotFoundException(
                'El usuario no está registrado como profesor',
            );
        }

        return profesor;
    }

    async obtenerAliasMP(idUsuario: number) {
        const cuenta =
            await this.profesoresRepository.obtenerAliasMP(idUsuario);

        if (!cuenta) {
            throw new NotFoundException(
                'El usuario no está registrado como profesor',
            );
        }

        return {
            alias_mp: cuenta.alias_mp ?? '',
        };
    }

    async guardarAliasMP(idUsuario: number, aliasMP: string) {
        if (!aliasMP || typeof aliasMP !== 'string') {
            throw new BadRequestException(
                'Tenés que ingresar un alias de Mercado Pago',
            );
        }

        const aliasNormalizado = aliasMP.trim();

        if (!aliasNormalizado || aliasNormalizado.length > 100) {
            throw new BadRequestException(
                'El alias debe tener entre 1 y 100 caracteres',
            );
        }

        const cuenta =
            await this.profesoresRepository.guardarAliasMP(
                idUsuario,
                aliasNormalizado,
            );

        if (!cuenta) {
            throw new NotFoundException(
                'El usuario no está registrado como profesor',
            );
        }

        return {
            mensaje: 'Alias de Mercado Pago actualizado correctamente',
            alias_mp: cuenta.alias_mp,
        };
    }
}