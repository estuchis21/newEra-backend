import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ClasesCronService {

    private readonly logger = new Logger(ClasesCronService.name);

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    // ============================================================
    // GENERAR LAS CLASES DEL DÍA
    //
    // Se ejecuta todos los días a las 00:00.
    // Ejecuta el procedimiento PostgreSQL:
    // CALL generar_clases_del_dia()
    // ============================================================

    @Cron('0 0 * * *')
    async generarClasesDelDia(): Promise<void> {

        this.logger.log(
            'Iniciando generación automática de clases del día...',
        );

        try {

            const result = await this.databaseService.query(
                'CALL generar_clases_del_dia()',
            );

            this.logger.log(
                `Generación de clases finalizada. Registros afectados: ${result.rowCount ?? 0}`,
            );

        } catch (error) {

            this.logger.error(
                'Error al generar las clases del día.',
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    // ============================================================
    // FINALIZAR LAS CLASES
    //
    // Se ejecuta cada minuto.
    // Busca las clases pendientes cuya hora de finalización
    // ya pasó y las cambia a "Realizada".
    //
    // Ejecuta el procedimiento PostgreSQL:
    // CALL finalizar_clases()
    // ============================================================

    @Cron('* * * * *')
    async finalizarClases(): Promise<void> {

        try {

            const result = await this.databaseService.query(
                'CALL finalizar_clases()',
            );

            const clasesFinalizadas = result.rowCount ?? 0;

            if (clasesFinalizadas > 0) {

                this.logger.log(
                    `Clases finalizadas automáticamente: ${clasesFinalizadas}`,
                );
            }

        } catch (error) {

            this.logger.error(
                'Error al finalizar las clases.',
                error instanceof Error ? error.stack : String(error),
            );
        }
    }
}