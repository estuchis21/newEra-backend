
import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

import { CreateAlumnoDto } from '../dto/createalumno.dto';

@Injectable()
export class AlumnosRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    // =====================================================
    // CREAR USUARIO
    // =====================================================

    async createAlumno(
        dto: CreateAlumnoDto,
    ) {

        // =================================================
        // 1. VERIFICAR EMAIL
        // =================================================

        const existe_mail =
            await this.databaseService.query(
                `
                SELECT findByEmail($1)
                `,
                [
                    dto.usuario.email,
                ],
            );

        if (
            existe_mail.rows[0]?.findbyemail
        ) {

            throw new ConflictException(
                'El correo electrónico ya está registrado',
            );

        }


        // =================================================
        // 2. VERIFICAR DNI
        // =================================================

        const existe_dni =
            await this.databaseService.query(
                `
                SELECT findByDni($1)
                `,
                [
                    dto.usuario.dni,
                ],
            );

        if (
            existe_dni.rows[0]?.findbydni
        ) {

            throw new ConflictException(
                'El DNI ya está registrado',
            );

        }


        // =================================================
        // 3. DETERMINAR SI ES MENOR
        // =================================================
        //
        // 1 = Administrador
        // 2 = Alumno
        // 3 = Profesor
        //
        // Solo los alumnos tienen es_menor.
        // =================================================

        const esMenor =
            dto.usuario.id_rol === 2
                ? dto.es_menor
                : null;


        try {

            // =============================================
            // 4. CREAR USUARIO + ALUMNO/PROFESOR
            // =============================================

            await this.databaseService.query(
                `
                CALL public.registroalumno(

                    ROW(
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8
                    )::public.alumno_input,

                    ROW(
                        NULL,
                        $9
                    )::public.alumnos_type,

                    ROW(
                        NULL
                    )::public.profesorestype,

                    NULL::integer

                )
                `,
                [
                    dto.usuario.nombre,
                    dto.usuario.apellido,
                    dto.usuario.dni,
                    dto.usuario.email,
                    dto.usuario.contrasena,
                    dto.usuario.username,
                    dto.usuario.celular,
                    dto.usuario.id_rol,
                    esMenor,
                ],
            );


            // =============================================
            // 5. OBTENER USUARIO RECIÉN CREADO
            // =============================================

            const usuario =
                await this.databaseService.query(
                    `
                    SELECT
                        u.id_usuario,
                        u.nombre,
                        u.apellido,
                        u.dni,
                        u.email,
                        u.username,
                        u.celular,
                        u.id_rol
                    FROM users u
                    WHERE u.email = $1
                    `,
                    [
                        dto.usuario.email,
                    ],
                );


            if (
                usuario.rows.length === 0
            ) {

                throw new Error(
                    'El usuario fue creado pero no pudo ser recuperado',
                );

            }


            // =============================================
            // 6. DEVOLVER USUARIO
            // =============================================

            return usuario.rows[0];


        } catch (error: any) {

            // =============================================
            // 7. MANEJAR DUPLICADOS
            // =============================================

            if (
                error.code === '23505'
            ) {

                switch (
                    error.constraint
                ) {

                    case 'users_username_key':

                        throw new ConflictException(
                            'El username ya está registrado',
                        );


                    case 'users_email_key':

                        throw new ConflictException(
                            'El correo electrónico ya está registrado',
                        );


                    case 'users_dni_key':

                        throw new ConflictException(
                            'El DNI ya está registrado',
                        );


                    default:

                        throw new ConflictException(
                            'El dato ingresado ya existe',
                        );
                }
            }


            throw error;
        }
    }


    // =====================================================
    // BUSCAR USUARIO POR EMAIL
    // =====================================================

    async findByEmail(
        email: string,
    ) {

        const resultado =
            await this.databaseService.query(
                `
                SELECT *
                FROM public.buscar_usuario($1)
                `,
                [
                    email,
                ],
            );


        if (
            !resultado.rows ||
            resultado.rows.length === 0
        ) {

            return null;

        }


        return resultado.rows[0];
    }


    // =====================================================
    // OBTENER ID ALUMNO POR USUARIO
    // =====================================================

    async obtenerIdAlumnoPorUsuario(
        id_usuario: number,
    ) {

        const resultado =
            await this.databaseService.query(
                `
                SELECT
                    obtener_id_alumno_por_usuario(
                        $1::integer
                    ) AS id_alumno
                `,
                [
                    id_usuario,
                ],
            );


        return resultado.rows[0]?.id_alumno ?? null;
    }


    // =====================================================
    // BUSCAR USUARIO
    // =====================================================

    async buscarUsuario(
        id_usuario: number,
    ) {

        const resultado =
            await this.databaseService.query(
                `
                SELECT *
                FROM buscar_usuario($1)
                `,
                [
                    id_usuario,
                ],
            );


        return resultado.rows[0] ?? null;
    }


    // =====================================================
    // EXISTE USERNAME
    // =====================================================

    async existeUsername(
        username: string,
    ) {

        const resultado =
            await this.databaseService.query(
                `
                SELECT existeUsername($1) AS existe
                `,
                [
                    username,
                ],
            );


        return (
            resultado.rows[0]?.existe
            ?? false
        );
    }


    // =====================================================
    // EXISTE DNI
    // =====================================================

    async existeDni(
        dni: string,
    ) {

        const resultado =
            await this.databaseService.query(
                `
                SELECT existeDni($1) AS existe
                `,
                [
                    dni,
                ],
            );


        return (
            resultado.rows[0]?.existe
            ?? false
        );
    }
}

