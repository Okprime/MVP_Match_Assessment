import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class BuyProductDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amountOfProducts: number;
}
