
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarTransferenciaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto_transferido!: number;

  @IsDateString()
  fecha_transferencia!: string;

  @IsString()
  @MaxLength(150)
  id_operacion_transferencia!: string;

  @IsOptional()
  @IsString()
  observaciones_transferencia?: string;
}
