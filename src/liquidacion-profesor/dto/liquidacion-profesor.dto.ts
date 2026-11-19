
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarTransferenciaDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser numérico y tener hasta dos decimales.' },
  )
  @Min(0.01, {
    message: 'El monto transferido debe ser mayor que cero.',
  })
  monto_transferido!: number;

  @IsDateString(
    {},
    { message: 'La fecha de transferencia no es válida.' },
  )
  fecha_transferencia!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_cuenta?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  id_operacion_transferencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones_transferencia?: string;
}
