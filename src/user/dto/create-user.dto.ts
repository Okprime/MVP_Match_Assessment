import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({ default: 0 })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  deposit: number;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  role: string;
}
