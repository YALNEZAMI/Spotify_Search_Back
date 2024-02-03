import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import dotenv = require('dotenv');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());
  dotenv.config();

  await app.listen(3000);
}
bootstrap();
