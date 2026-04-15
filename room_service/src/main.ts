import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tự động validate tất cả DTO, reject unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown fields
      forbidNonWhitelisted: true, // 400 nếu có field lạ
      transform: true,            // auto-cast types (string -> number)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Werewolf Room Service')
    .setDescription('API Documentation for the Werewolf Online Room Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`[Room Service] Running on http://localhost:${port}`);
  console.log(`[Room Service] Swagger Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
