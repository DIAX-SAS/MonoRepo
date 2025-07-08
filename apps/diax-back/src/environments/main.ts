import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        /\.diax\.website$/,
        /^http:\/\/localhost(:\d+)?$/,
        "https://diax.website",
      ];
      if (!origin || allowedOrigins.some(pattern =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin)) {
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

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Diax API')
    .setDescription('API documentation for Diax backend')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT auth to Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = process.env.BACK_PORT || 3000;
  await app.listen(port);

  Logger.log(`Diax is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`Swagger docs available at: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
