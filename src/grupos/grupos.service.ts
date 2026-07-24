import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { GruposRepository } from '../grupos/grupos.repository/grupos.repository';
import { Grupos_Alumnos } from '../grupos/dto/grupos.dto';
import { CreateGrupoClaseDto } from '../grupos/dto/alumnos_clases.dto';


@Injectable()
export class GruposService {
    constructor(
        private readonly gruposRepository: GruposRepository
    ){}

    async crearGrupo(dto: Grupos_Alumnos){
        if(dto.cupo_max <= 0){
            throw new ConflictException(
                'El cupo debe ser mayor a 0'
            );
        }

        if(dto.hora_fin <= dto.hora_inicio){
            throw new ConflictException(
                'Horario inválido'
            );

        }
        try {

            await this.gruposRepository.crearGrupo(dto);
            return {
                message: 'Grupo creado correctamente'
            };
        } catch(error){
            throw new ConflictException(
                'Error creando grupo'
            );
        }
    }


    async obtenerGrupos(id_alumno: number){
        const clases = await this.gruposRepository.obtenerGrupos(
            id_alumno
        );
        if(clases.length === 0){
            throw new NotFoundException(
                'No se encontraron clases para el alumno'
            );
        }
        return clases;
    }


    async todasLasClases(){


        const clases = await this.gruposRepository.todasLasClases();


        if(clases.length === 0){

            throw new NotFoundException(
                'No existen clases registradas'
            );

        }


        return clases;

    }




    async clasePorId(id_clase:number){


        const clase = await this.gruposRepository.clasePorId(
            id_clase
        );


        if(!clase){

            throw new NotFoundException(
                'No se encontró la clase'
            );

        }


        return clase;

    }

}