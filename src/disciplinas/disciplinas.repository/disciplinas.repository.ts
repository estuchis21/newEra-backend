import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDisciplinaDto } from '../dto/disciplinas.dto';

@Injectable()
export class DisciplinasRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async obtenerDisciplina(
        id_disciplina: number
    ){

        const result = await this.databaseService.query(
            `
            SELECT * FROM buscarDisciplina($1)
            `,
            [
                id_disciplina
            ]
        );


        return result.rows[0];

    }

    async crearDisciplina(
        dto: CreateDisciplinaDto
    ){

        await this.databaseService.query(
            `
            CALL insertarDisciplina(
                ROW($1)::disciplinas_type
            )
            `,
            [
                dto.disciplina
            ]
        );

    }

    async existeDisciplinaNombre(
        disciplina: string
    ){

        const result = await this.databaseService.query(
            `
            SELECT existeDisciplinaNombre($1) AS existe
            `,
            [
                disciplina
            ]
        );

        return result.rows[0].existe;

    }
}
