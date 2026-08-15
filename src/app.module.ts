import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import databaseConfig from './database/database.config';
import { DatabaseModule } from './database/database.module';

import { AlumnosModule } from './alumnos/alumnos.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { BoletinesModule } from './boletines/boletines.module';
import { ClasesModule } from './clases/clases.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';
import { GruposModule } from './grupos/grupos.module';
import { HorariosModule } from './horarios/horarios.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { PagosModule } from './pagos/pagos.module';
import { ProfesoresModule } from './profesores/profesores.module';
import { RetiroMenoresModule } from './retiro-menores/retiro-menores.module';

import { MercadopagoModule } from './integrations/mercadopago/mercadopago.module';

@Module({
    imports: [

        ConfigModule.forRoot({
            isGlobal: true,

            load: [
                databaseConfig,
            ],
        }),

        ScheduleModule.forRoot(),

        DatabaseModule,

        AlumnosModule,
        ProfesoresModule,
        DisciplinasModule,
        GruposModule,
        HorariosModule,
        InscripcionesModule,
        ClasesModule,
        AsistenciasModule,
        BoletinesModule,
        CuotasModule,
        PagosModule,
        RetiroMenoresModule,

        MercadopagoModule,
    ],

    controllers: [
        AppController,
    ],

    providers: [
        AppService,
    ],
})
export class AppModule {}