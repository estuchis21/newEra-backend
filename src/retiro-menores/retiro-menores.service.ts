
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import {
    RetiroMenoresRepository,
    CrearPersonaAutorizada,
    ActualizarPersonaAutorizada,
    RegistrarRetiro,
} from '../retiro-menores/retiro-menores.repository/retiro-menores.repository';

@Injectable()
export class RetiroMenoresService {

    constructor(
        private readonly retiroRepository: RetiroMenoresRepository,
    ) {}

    // ========================================================
    // VALIDACIONES AUXILIARES
    // ========================================================

    private validarId(id: number, campo = 'ID') {

        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException(
                `${campo} debe ser un número entero positivo`,
            );
        }
    }

    private validarTexto(
        valor: string | undefined,
        campo: string,
    ) {

        if (
            typeof valor !== 'string' ||
            valor.trim().length === 0
        ) {
            throw new BadRequestException(
                `${campo} es obligatorio`,
            );
        }
    }

    // ========================================================
    // REGISTRAR PERSONA AUTORIZADA
    // ========================================================

    async crearPersonaAutorizada(
        data: CrearPersonaAutorizada,
    ) {

        if (!data) {
            throw new BadRequestException(
                'Debés proporcionar los datos de la persona autorizada',
            );
        }

        this.validarId(data.id_alumno, 'ID del alumno');

        this.validarTexto(data.nombre, 'Nombre');
        this.validarTexto(data.apellido, 'Apellido');
        this.validarTexto(data.dni, 'DNI');

        const persona = await this.retiroRepository.crearPersonaAutorizada({
            ...data,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            dni: data.dni.trim(),
        });

        if (!persona) {
            throw new BadRequestException(
                'No se pudo registrar la persona. Verificá que el alumno exista y sea menor de edad.',
            );
        }

        return {
            mensaje: 'Persona autorizada registrada correctamente',
            persona,
        };
    }

    // ========================================================
    // LISTAR PERSONAS AUTORIZADAS
    // ========================================================

    async obtenerPersonasAutorizadas(id_alumno: number) {

        this.validarId(id_alumno, 'ID del alumno');

        return this.retiroRepository.obtenerPersonasAutorizadas(
            id_alumno,
        );
    }

    // ========================================================
    // OBTENER PERSONA AUTORIZADA
    // ========================================================

    async obtenerPersonaAutorizada(id_autorizada: number) {

        this.validarId(id_autorizada, 'ID de autorización');

        const persona =
            await this.retiroRepository.obtenerPersonaAutorizada(
                id_autorizada,
            );

        if (!persona) {
            throw new NotFoundException(
                'No se encontró la persona autorizada',
            );
        }

        return persona;
    }

    // ========================================================
    // ACTUALIZAR PERSONA AUTORIZADA
    // ========================================================

    async actualizarPersonaAutorizada(
        id_autorizada: number,
        data: ActualizarPersonaAutorizada,
    ) {

        this.validarId(id_autorizada, 'ID de autorización');

        if (!data || Object.keys(data).length === 0) {
            throw new BadRequestException(
                'Debés proporcionar al menos un campo para actualizar',
            );
        }

        const permitidos = [
            'nombre',
            'apellido',
            'dni',
            'parentesco',
            'telefono',
        ];

        const camposRecibidos = Object.keys(data);

        if (
            camposRecibidos.some(
                campo => !permitidos.includes(campo),
            )
        ) {
            throw new BadRequestException(
                'Se proporcionaron campos no permitidos',
            );
        }

        for (const campo of ['nombre', 'apellido', 'dni'] as const) {

            const valor = data[campo];

            if (
                valor !== undefined &&
                (
                    typeof valor !== 'string' ||
                    valor.trim().length === 0
                )
            ) {
                throw new BadRequestException(
                    `${campo} no puede estar vacío`,
                );
            }
        }

        const actualizado =
            await this.retiroRepository.actualizarPersonaAutorizada(
                id_autorizada,
                data,
            );

        if (!actualizado) {
            throw new NotFoundException(
                'No se encontró la persona autorizada o está inactiva',
            );
        }

        return {
            mensaje: 'Persona autorizada actualizada correctamente',
            persona: actualizado,
        };
    }

    // ========================================================
    // DESACTIVAR PERSONA AUTORIZADA
    // ========================================================

    async desactivarPersonaAutorizada(id_autorizada: number) {

        this.validarId(id_autorizada, 'ID de autorización');

        const resultado =
            await this.retiroRepository.desactivarPersonaAutorizada(
                id_autorizada,
            );

        if (!resultado) {
            throw new NotFoundException(
                'La persona autorizada no existe o ya está desactivada',
            );
        }

        return {
            mensaje: 'Autorización desactivada correctamente',
            id_autorizada: resultado.id_autorizada,
        };
    }

    // ========================================================
    // REGISTRAR RETIRO
    // ========================================================

    async registrarRetiro(data: RegistrarRetiro) {

        if (!data) {
            throw new BadRequestException(
                'Debés proporcionar los datos del retiro',
            );
        }

        this.validarId(data.id_alumno, 'ID del alumno');
        this.validarId(data.id_autorizada, 'ID de autorización');
        this.validarId(data.id_profesor, 'ID del profesor');

        if (
            data.observaciones !== undefined &&
            typeof data.observaciones !== 'string'
        ) {
            throw new BadRequestException(
                'Las observaciones deben ser un texto',
            );
        }

        const retiro = await this.retiroRepository.registrarRetiro(
            data,
        );

        if (!retiro) {
            throw new BadRequestException(
                'No se pudo registrar el retiro. Verificá que el alumno sea menor, que el adulto esté autorizado y activo, y que el profesor tenga al alumno inscripto en uno de sus grupos.',
            );
        }

        const constancia =
            await this.retiroRepository.obtenerRetiroPorId(
                retiro.id_retiro,
            );

        return {
            mensaje: 'Retiro registrado correctamente',
            retiro: constancia,
        };
    }

    // ========================================================
    // OBTENER HISTORIAL
    // ========================================================

    async obtenerHistorial(
        id_alumno?: number,
        id_profesor?: number,
    ) {

        if (id_alumno !== undefined) {
            this.validarId(id_alumno, 'ID del alumno');
        }

        if (id_profesor !== undefined) {
            this.validarId(id_profesor, 'ID del profesor');
        }

        return this.retiroRepository.obtenerHistorial(
            id_alumno,
            id_profesor,
        );
    }

    // ========================================================
    // OBTENER CONSTANCIA / PLANILLA
    // ========================================================

    async obtenerPlanilla(id_retiro: number) {

        this.validarId(id_retiro, 'ID del retiro');

        const retiro =
            await this.retiroRepository.obtenerRetiroPorId(
                id_retiro,
            );

        if (!retiro) {
            throw new NotFoundException(
                'No se encontró el registro de retiro',
            );
        }

        return {
            titulo: 'CONSTANCIA DE RETIRO DE MENOR',
            academia: 'ACADEMIA NEW ERA',
            retiro,
        };
    }

}
