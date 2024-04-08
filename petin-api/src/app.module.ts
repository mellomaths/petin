import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './domain/health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './domain/users/users.module';
import { AuthModule } from './domain/auth/auth.module';
import sessionConfig from './infrastructure/config/session.config';
import serverConfig from './infrastructure/config/server.config';
import authConfig from './infrastructure/config/auth.config';
import databaseConfig from './infrastructure/config/database.config';
import { HttpLoggerMiddleware } from './infrastructure/middlewares/http-logger.middleware';
import { PetsModule } from './domain/pets/pets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development'],
      load: [serverConfig, sessionConfig, authConfig, databaseConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // * 60000ms = 60s
        limit: 10, // * 10 requests max within a minute
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) | 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: process.env.NODE_ENV !== 'production',
      // ! Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
      logging: true,
      cache: false,
      retryAttempts: 3,
      retryDelay: 3000, // * 3000ms = 3s
      autoLoadEntities: true,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    PetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
