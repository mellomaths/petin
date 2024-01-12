import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as csurf from 'csurf';
import helmet from 'helmet';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Petin - API')
    .setDescription(
      'It gives operation to be executed by the Petin Core System',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      cookie: {},
      resave: false,
      saveUninitialized: false,
    }),
  );
  // app.use(csurf({ cookie: true }));

  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
