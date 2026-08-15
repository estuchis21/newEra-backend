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
    // Se ejecuta todos los días a las 00:00
    // ============================================================

    @Cron('0 0 * * *')
    async generarClasesDelDia() {

        this.logger.log(
            'Ejecutando generación automática de clases...',
        );

        try {

            const result = await this.databaseService.query(
                `CALL generar_clases_del_dia()`,
            );

            this.logger.log(
                `Clases creadas: ${result.rowCount}`,
            );

        } catch (error) {

            this.logger.error(
                'Error generando las clases del día',
                error,
            );

        }
    }


    // ============================================================
    // FINALIZAR LAS CLASES
    //
    // Cada minuto busca clases pendientes cuya hora_fin
    // ya pasó y las cambia a Realizada.
    // ============================================================

    @Cron('* * * * *')
    async finalizarClases() {

        this.logger.log(
            'Verificando clases finalizadas...',
        );

        try {

            const result = await this.databaseService.query(
                `CALL finalizar_clases()`,
            );

            if ((result.rowCount ?? 0) > 0) {
                this.logger.log(
                    `Clases finalizadas: ${result.rowCount ?? 0}`,
                );

            }

        } catch (error) {

            this.logger.error(
                'Error finalizando las clases',
                error,
            );

        }
    }
}