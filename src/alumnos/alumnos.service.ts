import { Injectable } from '@nestjs/common';
import { AlumnosRepository } from './alumnos.repository/alumnos.repository';
import { CreateAlumnoDto } from './dto/createalumno.dto';
import bycrypt from 'bcrypt';

@Injectable()
export class AlumnosService {
  constructor ( 
    private readonly alumnosRepository: AlumnosRepository, 
  ) {}

  async RegistrarAlumno (
    dto: CreateAlumnoDto
  ){

    const saltRounds = 10;
    dto.usuario.contrasena =
      await bycrypt.hash(
        dto.usuario.contrasena,
        saltRounds,
      );

      return this.alumnosRepository.createAlumno(dto);
  }

}
