import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StrippedUser } from '../../user/dto/stripped-user.dto';

@Exclude()
export class ProductDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  amountAvailable: string;

  @Expose()
  @ApiProperty()
  role: string;

  @Expose()
  @ApiProperty()
  cost: number;

  @Expose()
  @ApiProperty()
  @Type(() => StrippedUser)
  seller: StrippedUser;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}
