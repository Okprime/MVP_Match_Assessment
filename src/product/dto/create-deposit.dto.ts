import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class DepositDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
