import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ClasesCronService {

    private readonly logger = new Logger(ClasesCronService.name);

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    @Cron('* * * * *')
    async generarClasesDiarias() {

        this.logger.log('Generando clases del día...');

        await this.databaseService.query(
            `SELECT generar_clases_del_dia();`
        );

        this.logger.log('Clases generadas correctamente');
    }
}