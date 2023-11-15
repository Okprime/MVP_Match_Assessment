import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsNumber()
  deposit?: number;

  @ApiPropertyOptional()
  @IsString()
  role?: string;
}
