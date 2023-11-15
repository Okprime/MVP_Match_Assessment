import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as jwt from 'jsonwebtoken';
import * as casual from 'casual';
import { Product } from './../src/product/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let productRepository: Repository<Product>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productRepository = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    const user = await userRepository.save({
      username: casual.username,
      password: casual.password,
      deposit: 800,
      role: 'seller',
    });

    // Insert test products into the database
    const testProducts = [
      {
        amountAvailable: 10,
        cost: 50,
        productName: 'Test Product 1',
        sellerId: user.id,
      },
      {
        amountAvailable: 5,
        cost: 30,
        productName: 'Test Product 2',
        sellerId: user.id,
      },
      {
        amountAvailable: 100,
        cost: 25,
        productName: 'Test Product 3',
        sellerId: user.id,
      },
      {
        amountAvailable: 50,
        cost: 10,
        productName: 'Test Product 4',
        sellerId: user.id,
      },
    ];

    await productRepository.save(testProducts);

    const testUserId = casual.uuid;

    // Generate a test token directly within the test file
    authToken = jwt.sign(
      { username: casual.username, sub: testUserId, role: 'buyer' },
      'defaultSecretKey',
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await userRepository.createQueryBuilder().delete().from(Product).execute();

    await app.close();
  });

  it('/product/deposit (POST) - should deposit for a buyer', async () => {
    const depositDto = { amount: 100 };

    const response = await request(app.getHttpServer())
      .post('/product/deposit')
      .set('Authorization', `Bearer ${authToken}`)
      .send(depositDto);

    expect(response.body).toBeDefined();
  });

  it('/product/buy (POST) - should handle buying a product for a buyer', async () => {
    const purchaseDto = { productId: 2, amountOfProducts: 1 };

    const response = await request(app.getHttpServer())
      .post('/product/buy')
      .set('Authorization', `Bearer ${authToken}`)
      .send(purchaseDto);

    expect(response.body).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
