
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import {
    BoletinesRepository,
    CrearBoletinData,
    ActualizarBoletinData,
    FiltrosBoletines,
} from '../boletines/boletines.repository/boletines.repository';

@Injectable()
export class BoletinesService {

    constructor(
        private readonly boletinesRepository: BoletinesRepository,
    ) {}

    // ========================================================
    // LISTAR TODOS LOS BOLETINES
    // ========================================================

    async obtenerTodos(filtros: FiltrosBoletines = {}) {

        return this.boletinesRepository.obtenerTodos(filtros);
    }

    // ========================================================
    // OBTENER POR ID
    // ========================================================

    async obtenerPorId(id_boletin: number) {

        const boletin = await this.boletinesRepository.obtenerPorId(
            id_boletin,
        );

        if (!boletin) {
            throw new NotFoundException(
                `No existe el boletín ${id_boletin}`,
            );
        }

        return boletin;
    }

    // ========================================================
    // OBTENER BOLETINES DE UN ALUMNO
    // ========================================================

    async obtenerPorAlumno(id_alumno: number) {

        if (!Number.isInteger(id_alumno) || id_alumno <= 0) {
            throw new BadRequestException(
                'El ID del alumno no es válido',
            );
        }

        return this.boletinesRepository.obtenerPorAlumno(id_alumno);
    }

    // ========================================================
    // OBTENER BOLETINES DE UN GRUPO
    // ========================================================

    async obtenerPorGrupo(id_grupo: number) {

        if (!Number.isInteger(id_grupo) || id_grupo <= 0) {
            throw new BadRequestException(
                'El ID del grupo no es válido',
            );
        }

        return this.boletinesRepository.obtenerPorGrupo(id_grupo);
    }

    // ========================================================
    // OBTENER BOLETINES DE UN PROFESOR
    // ========================================================

    async obtenerPorProfesor(id_profesor: number) {

        if (!Number.isInteger(id_profesor) || id_profesor <= 0) {
            throw new BadRequestException(
                'El ID del profesor no es válido',
            );
        }

        return this.boletinesRepository.obtenerPorProfesor(id_profesor);
    }

    // ========================================================
    // OBTENER BOLETINES POR PERIODO
    // ========================================================

    async obtenerPorPeriodo(id_periodo: number) {

        if (!Number.isInteger(id_periodo) || id_periodo <= 0) {
            throw new BadRequestException(
                'El ID del período no es válido',
            );
        }

        return this.boletinesRepository.obtenerPorPeriodo(id_periodo);
    }

    // ========================================================
    // CREAR BOLETIN
    // ========================================================

    async crear(data: CrearBoletinData) {

        if (
            !data.id_alumno ||
            !data.id_grupo ||
            !data.id_profesor ||
            !data.id_periodo ||
            !data.anio
        ) {
            throw new BadRequestException(
                'Todos los campos obligatorios deben estar completos',
            );
        }

        const ids = [
            data.id_alumno,
            data.id_grupo,
            data.id_profesor,
            data.id_periodo,
        ];

        if (
            ids.some(
                id => !Number.isInteger(id) || id <= 0,
            )
        ) {
            throw new BadRequestException(
                'Los identificadores deben ser números enteros positivos',
            );
        }

        if (
            !Number.isInteger(data.anio) ||
            data.anio < 2000 ||
            data.anio > 2100
        ) {
            throw new BadRequestException(
                'El año del boletín no es válido',
            );
        }

        if (
            data.fecha_evaluacion !== undefined &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha_evaluacion)
        ) {
            throw new BadRequestException(
                'La fecha de evaluación debe tener formato YYYY-MM-DD',
            );
        }

        const boletin = await this.boletinesRepository.crear(data);

        if (!boletin) {
            throw new BadRequestException(
                'No se pudo crear el boletín. Verificá que el alumno esté inscripto en el grupo, que el profesor sea el responsable y que la fecha pertenezca al período de evaluación.',
            );
        }

        return this.obtenerPorId(boletin.id_boletin);
    }

    // ========================================================
    // ACTUALIZAR BOLETIN
    // ========================================================

    async actualizar(
        id_boletin: number,
        data: ActualizarBoletinData,
    ) {

        if (!Number.isInteger(id_boletin) || id_boletin <= 0) {
            throw new BadRequestException(
                'El ID del boletín no es válido',
            );
        }

        if (
            data.observaciones === undefined &&
            data.fecha_evaluacion === undefined
        ) {
            throw new BadRequestException(
                'Debés proporcionar al menos un campo para actualizar',
            );
        }

        if (
            data.fecha_evaluacion !== undefined &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha_evaluacion)
        ) {
            throw new BadRequestException(
                'La fecha de evaluación debe tener formato YYYY-MM-DD',
            );
        }

        const actualizado = await this.boletinesRepository.actualizar(
            id_boletin,
            data,
        );

        if (!actualizado) {
            throw new NotFoundException(
                `No existe el boletín ${id_boletin}`,
            );
        }

        return this.obtenerPorId(id_boletin);
    }

    // ========================================================
    // ELIMINAR BOLETIN
    // ========================================================

    async eliminar(id_boletin: number) {

        if (!Number.isInteger(id_boletin) || id_boletin <= 0) {
            throw new BadRequestException(
                'El ID del boletín no es válido',
            );
        }

        const eliminado = await this.boletinesRepository.eliminar(
            id_boletin,
        );

        if (!eliminado) {
            throw new NotFoundException(
                `No existe el boletín ${id_boletin}`,
            );
        }

        return {
            mensaje: 'Boletín eliminado correctamente',
            id_boletin: eliminado.id_boletin,
        };
    }

}
