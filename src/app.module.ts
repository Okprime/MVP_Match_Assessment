import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host:
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_POSTGRES_HOST
            : process.env.POSTGRES_HOST,
        port: Number(
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_POSTGRES_PORT
            : process.env.POSTGRES_PORT,
        ),
        username:
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_POSTGRES_USER
            : process.env.POSTGRES_USER,
        password:
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_POSTGRES_PASSWORD
            : process.env.POSTGRES_PASSWORD,
        database:
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_POSTGRES_DATABASE
            : process.env.POSTGRES_DATABASE,
        autoLoadEntities: true,
        entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
