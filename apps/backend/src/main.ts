import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const globalPrefix = 'api';
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }); 
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Convierte los datos automáticamente (ej. string → Date)
      whitelist: true, // Remueve campos no definidos en el DTO
      forbidNonWhitelisted: true, // Retorna error si hay campos no permitidos
    }),
  );
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
