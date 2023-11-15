import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsNumber()
  amountAvailable?: number;

  @ApiPropertyOptional()
  @IsNumber()
  cost?: number;
}
