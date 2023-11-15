import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { StrippedUser } from './dto/stripped-user.dto';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersQueryParams } from './dto/get-all-users-query-params.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description: 'Create a user',
    type: StrippedUser,
  })
  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOkResponse({
    description: 'Returns all users',
    type: StrippedUser,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers(@Query() queryParams: GetAllUsersQueryParams) {
    return plainToClass(
      StrippedUser,
      this.userService.getAllUsers(queryParams),
    );
  }

  @ApiOkResponse({
    description: 'Returns user own profile',
    type: StrippedUser,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return plainToClass(StrippedUser, this.userService.getUserById(id));
  }

  @ApiOkResponse({
    description: 'Update a user',
    type: StrippedUser,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiOkResponse({
    description: 'Delete a user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
