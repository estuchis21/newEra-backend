import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { ProfesoresRepository } from './profesores.repository/profesores.repository';

@Injectable()
export class ProfesoresService {

    constructor(
        private readonly profesoresRepository:
            ProfesoresRepository,
    ) {}

    async obtenerProfesorPorUsuario(
        idUsuario: number,
    ) {

        const profesor =
            await this.profesoresRepository
                .obtenerProfesorPorUsuario(
                    idUsuario,
                );

        if (!profesor) {

            throw new NotFoundException(
                'El usuario no está registrado como profesor',
            );

        }

        return profesor;
    }
}