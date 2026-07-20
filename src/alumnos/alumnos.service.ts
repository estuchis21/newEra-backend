import { 
  Injectable,
  UnauthorizedException
} from '@nestjs/common';


import { AlumnosRepository } 
from './alumnos.repository/alumnos.repository';


import { CreateAlumnoDto } 
from './dto/createalumno.dto';


import { LoginDto } 
from './dto/login.dto';


import * as bcrypt from 'bcrypt';



@Injectable()
export class AlumnosService {


  constructor(
    private readonly alumnosRepository: AlumnosRepository
  ) {}




  async RegistrarAlumno(
    dto: CreateAlumnoDto
  ){


    const saltRounds = 10;


    dto.usuario.contrasena =
      await bcrypt.hash(
        dto.usuario.contrasena,
        saltRounds
      );



    return this.alumnosRepository.createAlumno(dto);

  }







  async login(
    dto: LoginDto
  ){



    const usuario =
      await this.alumnosRepository.findByEmail(
        dto
      );



    if(!usuario){


      throw new UnauthorizedException(
        'Email o contraseña incorrectos'
      );

    }





    const passwordValida =
      await bcrypt.compare(

        dto.contrasena,

        usuario.contrasena

      );





    if(!passwordValida){


      throw new UnauthorizedException(
        'Email o contraseña incorrectos'
      );

    }





    return {


      id_usuario:
      usuario.id_usuario,


      nombre:
      usuario.nombre,


      apellido:
      usuario.apellido,


      email:
      usuario.email,


      id_rol:
      usuario.id_rol


    };

  }


}