import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('EduPathAI-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Enable CORS for frontend Vite dev server and production clients
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Serve static uploads for documents and introduction videos
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('EduPath AI — Applicant Journey API')
    .setDescription(
      'Agentic AI full-stack backend assisting Indian applicants with Study, Vocational Training (Ausbildung), and Employment in Germany.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log('===========================================================');
  logger.log(`🚀 EduPath AI Backend running at:   http://localhost:${port}`);
  logger.log(`📚 Swagger API Documentation at:     http://localhost:${port}/api/docs`);
  logger.log(`📁 Static Uploads hosted at:        http://localhost:${port}/uploads`);
  logger.log('===========================================================');
}

await bootstrap();
