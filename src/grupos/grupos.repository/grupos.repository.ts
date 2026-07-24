import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Grupos_Alumnos } from '../dto/grupos.dto';
import { CreateGrupoClaseDto } from '../dto/alumnos_clases.dto';

@Injectable()
export class GruposRepository {

    constructor(
        private readonly databaseService: DatabaseService
    ){}
    async crearGrupo(dto: Grupos_Alumnos){
        await this.databaseService.query(
            `
            CALL crear_grupo_clase(
                $1,$2,$3,$4,$5,$6,$7
            )
            `,
            [
                dto.id_disciplina,
                dto.id_profesor,
                dto.nivel,
                dto.cupo_max,
                dto.fecha,
                dto.hora_inicio,
                dto.hora_fin
            ]
        );
    }

    async obtenerGrupos(id_alumno: number){
        const result = await this.databaseService.query(
            `
            SELECT clases_por_alumnos($1) AS clases
            `,
            [
                id_alumno
            ]
        );
        return result.rows[0]?.clases ?? [];
    }

    async todasLasClases(){
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM todas_las_clases()
            `
        );
        return result.rows;
    }

    async clasePorId(id_clase: number){
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM buscar_clase_por_id($1)
            `,
            [
                id_clase
            ]
        );
        return result.rows[0] ?? null;

    }
}