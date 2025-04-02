import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        /\.diax\.website$/,
        /^http:\/\/localhost(:\d+)?$/
      ];
      if (!origin || allowedOrigins.some(pattern => pattern instanceof RegExp ? pattern.test(origin) : pattern === origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes unknown properties automatically
      forbidNonWhitelisted: true, // Throws an error for extra properties
      transform: true, // Auto-transforms payloads to DTO classes
    })
  );
  const port = process.env.BACK_PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Diax is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
