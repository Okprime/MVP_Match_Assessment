import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../src/user/entities/user.entity';
import * as casual from 'casual';
import * as jwt from 'jsonwebtoken';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let createUserDto: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    createUserDto = {
      username: casual.username,
      password: casual.password,
      role: 'buyer',
      deposit: 400,
    };
    const testUserId = casual.uuid;

    authToken = jwt.sign(
      { username: 'okprime', sub: testUserId, role: 'buyer' },
      'defaultSecretKey',
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await userRepository.createQueryBuilder().delete().from(User).execute();

    await app.close();
  });

  it('/user (POST) - should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/user')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toBeDefined();
  });

  it('/user (GET) - should get a list of users', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.body).toBeInstanceOf(Array);
  });

  it('/user/:id (GET) - should get a specific user', async () => {
    const user = await userRepository.save({
      username: casual.username,
      password: casual.password,
      deposit: 0,
      role: 'buyer',
    });

    const response = await request(app.getHttpServer())
      .get(`/user/${user.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.username).toEqual(user.username);
    expect(response.body.deposit).toEqual(user.deposit);
  });

  it('/user/:id (PUT) - should update a specific user', async () => {
    const user = await userRepository.save({
      username: casual.username,
      password: casual.password,
      deposit: 0,
      role: 'buyer',
    });

    const updateUserDto = {
      deposit: 100,
      role: 'seller',
    };

    const response = await request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateUserDto)
      .expect(200);

    expect(response.body.deposit).toEqual(updateUserDto.deposit);
    expect(response.body.role).toEqual(updateUserDto.role);
  });

  it('/user/:id (DELETE) - should delete a specific user', async () => {
    const user = await userRepository.save({
      username: casual.username,
      password: casual.password,
      deposit: 0,
      role: 'buyer',
    });

    await request(app.getHttpServer())
      .delete(`/user/${user.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Check that the user is deleted
    const deletedUser = await userRepository.findOne({
      where: {
        id: user.id,
      },
    });
    expect(deletedUser).toBe(null);
  });
});
