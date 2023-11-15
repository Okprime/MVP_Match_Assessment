import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessToken, UserPayload } from './types/user.types';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersQueryParams } from './dto/get-all-users-query-params.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(user: CreateUserDto): Promise<AccessToken> {
    const { username, password, role, deposit } = user;

    // Check if the username is already taken
    const existingUser: User = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserPayload = this.userRepository.create({
      username,
      password: hashedPassword,
      role,
      deposit,
    });

    const savedUser: User = await this.userRepository.save(newUser);

    const payload = {
      username: savedUser.username,
      sub: savedUser.id,
      role: savedUser.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return { accessToken };
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getAllUsers(queryParams: GetAllUsersQueryParams): Promise<User[]> {
    const { offset = 0, limit = 10 } = queryParams;

    const findOptions: FindManyOptions<User> = {
      skip: offset,
      take: limit,
      order: { ['createdAt']: 'DESC' },
    };

    return this.userRepository.find(findOptions);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userRepository.save({ id: userId, ...updateUserDto });
  }

  async deleteUser(userId: string) {
    await this.userRepository.delete({ id: userId });
    return 'Success';
  }
}
