import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amountAvailable: number;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  cost: number;
}
