import { Module } from '@nestjs/common';

import { ClasesCronService } from './clases-cron.service';
import { ClasesController } from './clases.controller';
import { ClasesRepository } from './clases.repository/clases.repository';
import { ClasesService } from './clases.service';

@Module({
    controllers: [
        ClasesController,
    ],

    providers: [
        ClasesService,
        ClasesRepository,
        ClasesCronService,
    ],
})
export class ClasesModule {}