import { 
  Body, 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';

import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/createalumno.dto';


@Controller('alumnos')
export class AlumnosController {


  constructor(
    private readonly alumnosService: AlumnosService
  ) {}


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAlumnoDto: CreateAlumnoDto
  ) {


    const result =
      await this.alumnosService.RegistrarAlumno(
        createAlumnoDto
      );


    return {
      statusCode: HttpStatus.CREATED,
      message: 'Alumno registrado exitosamente',
      data: result,
    };

  }

}