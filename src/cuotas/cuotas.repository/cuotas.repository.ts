import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    // ============================================================
    // CREAR CUOTA - TEST
    // ============================================================

    async crearCuota(
        idAlumno: number,
        idPaquete: number,
    ) {

        const result = await this.databaseService.query(
            `
            INSERT INTO cuota (
                id_alumno,
                id_paquete,
                mes_anio,
                monto,
                vencimiento,
                estado
            )
            SELECT
                $1,
                p.id_paquete,
                TO_CHAR(CURRENT_DATE, 'MM/YYYY'),
                p.precio,
                DATE_TRUNC(
                    'month',
                    CURRENT_DATE
                ) + INTERVAL '9 days',
                'Pendiente'
            FROM paquetes_creditos p
            WHERE p.id_paquete = $2
              AND p.activo = TRUE

            RETURNING *
            `,
            [
                idAlumno,
                idPaquete,
            ],
        );

        if (result.rows.length === 0) {

            throw new Error(
                'El paquete de créditos no existe o está inactivo',
            );

        }

        return result.rows[0];
    }


    // ============================================================
    // GENERAR CUOTAS DEL MES
    // ============================================================

    async generarCuotasMes() {

        await this.databaseService.query(
            `
            CALL generar_cuotas_mes()
            `,
        );

        return {
            mensaje:
                'Cuotas del mes generadas correctamente',
        };
    }


    // ============================================================
    // OBTENER CUOTA
    // ============================================================

    async obtenerCuota(
        idCuota: number,
    ) {

        const result = await this.databaseService.query(
            `
            SELECT *
            FROM obtener_cuota($1)
            `,
            [
                idCuota,
            ],
        );

        return result.rows[0] ?? null;
    }


    // ============================================================
    // OBTENER CUOTAS DE UN ALUMNO
    // ============================================================

    async obtenerCuotasAlumno(
        idAlumno: number,
    ) {

        const result = await this.databaseService.query(
            `
            SELECT *
            FROM obtener_cuota($1)
            `,
            [
                idAlumno,
            ],
        );

        return result.rows;
    }
}