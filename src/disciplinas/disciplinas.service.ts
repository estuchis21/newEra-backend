import {
    Injectable,
    ConflictException,
    NotFoundException
} from '@nestjs/common';

import { DisciplinasRepository } from './disciplinas.repository/disciplinas.repository';
import {CreateDisciplinaDto} from './dto/disciplinas.dto';

@Injectable()
export class DisciplinasService {

    constructor(
        private readonly disciplinasRepository: DisciplinasRepository
    ){}

    async crearDisciplina(
        dto: CreateDisciplinaDto
    ){

        if(!dto.disciplina || dto.disciplina.trim().length === 0){

            throw new ConflictException(
                'El nombre es obligatorio'
            );

        }


        // Normalizar nombre

        dto.disciplina = dto.disciplina
            .trim()
            .toLowerCase();



        // Validar duplicado

        const existe =
            await this.disciplinasRepository.existeDisciplinaNombre(
                dto.disciplina
            );


        if(existe){

            throw new ConflictException(
                'La disciplina ya existe'
            );

        }

        try{

            await this.disciplinasRepository.crearDisciplina(
                dto
            );

            return {
                message: 'Disciplina creada correctamente',
            };

        }catch(error){

            throw new ConflictException(
                'Error creando disciplina'
            );

        }

    }


    async obtenerDisciplina(
        id_disciplina: number
    ){

        const disciplina =
            await this.disciplinasRepository.obtenerDisciplina(
                id_disciplina
            );


        if(!disciplina){

            throw new NotFoundException(
                'La disciplina no existe'
            );

        }


        return disciplina;

    }


}