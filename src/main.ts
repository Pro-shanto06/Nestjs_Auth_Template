import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { appConfig } from './configuration/app.config';
import { CorsMiddleware } from './middleware/cors.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new CorsMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());

  const logger = new Logger('Bootstrap');
  await app.listen(appConfig.port);
  logger.log(`Application is running on: http://localhost:${appConfig.port}`);
}

bootstrap();
